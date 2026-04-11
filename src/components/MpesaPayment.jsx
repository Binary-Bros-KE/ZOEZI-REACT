"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AiOutlineClose, AiOutlineLoading3Quarters, AiOutlineCheckCircle } from "react-icons/ai"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_SERVER_URL

export default function MpesaPayment({ onClose, amount: initialAmount, onSuccess, userId }) {
  const [amount, setAmount] = useState(initialAmount || 0)
  const [phone, setPhone] = useState("")
  const [checkoutRequestId, setCheckoutRequestId] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [status, setStatus] = useState(false)
  const [error, setError] = useState("")
  const [showStkSuccess, setShowStkSuccess] = useState(false)
  const [amountSubmitted, setAmountSubmitted] = useState(!!initialAmount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amountSubmitted) {
      if (!amount || amount <= 0) {
        setError("Please enter a valid amount")
        return
      }
      setAmountSubmitted(true)
      setError("")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/mpesa/stk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ phone, amount }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowStkSuccess(true)
        setLoading(false)
        setCheckoutRequestId(data.CheckoutRequestID)

        if (!data.CheckoutRequestID) {
          throw new Error("Missing CheckoutRequestID in response")
        }

        // WebSocket connection for real-time payment status
        const ws = new WebSocket(import.meta.env.VITE_SOCKET_URL)

        ws.onopen = () => {
          ws.send(JSON.stringify({ action: "register", checkoutRequestId: data.CheckoutRequestID }))
        }

        ws.onmessage = (event) => {
          const result = JSON.parse(event.data)
          handleWebSocketResponse(result, ws)
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
        }

        ws.onclose = () => {
          // noop
        }
      } else {
        throw new Error(data.message || "Failed to initiate payment")
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleWebSocketResponse = async (result, ws) => {
    if (result.status === "success") {
      setStatus(true)
      toast.success("Payment Successful!")

      const paymentData = {
        amount,
        transactionId: result.data?.transactionId || result.data?.TransactionID,
        checkoutRequestId: checkoutRequestId,
        phone,
        timeOfPayment: new Date().toISOString(),
      }

      // Notify parent and close — parent handles persistence/update
      try {
        onSuccess(paymentData)
      } catch (err) {
        console.error("onSuccess handler threw:", err)
      }

      // close websocket if open
      if (ws && ws.readyState === WebSocket.OPEN) ws.close()

      setTimeout(() => onClose && onClose(), 800)
    } else {
      toast.error(result.message || "Payment failed")
      setError(result.message || "Payment failed")
    }
  }

  const handleCheckPaymentStatus = async () => {
    if (!checkoutRequestId) {
      setError("Missing CheckoutRequestID. Please Initiate STK Again.")
      return
    }
    setPaymentLoading(true)

    try {
      const response = await fetch(`${API_URL}/mpesa/paymentStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ CheckoutRequestId: checkoutRequestId }),
      })

      const data = await response.json()
      console.log("Payment status response:", data)
      setPaymentLoading(false)

    } catch (err) {
      setPaymentLoading(false)
      setError(err.message)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white  border-4 border-brand-gold rounded-2xl p-6 max-w-md w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <AiOutlineClose className="text-2xl" />
          </button>

          <h2 className="text-2xl font-bold text-text-primary mb-6">LIPA NA M-PESA</h2>

          {!status ? (
            <>
              {!amountSubmitted ? (
                <div className="bg-primary/10 border-2 border-green-600/30 rounded-lg p-4 mb-6 text-center">
                  <img src="/graphics/mpesa-circular.png" alt="M-Pesa" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                  <p className="text-text-secondary mb-2">Enter Amount:</p>
                  <p className="text-sm text-text-secondary">You will receive an STK prompt on your phone</p>
                </div>
              ) : !showStkSuccess ? (
                <div className="bg-primary/10 border-2 border-green-600/30 rounded-lg p-4 mb-6 text-center">
                  <img src="/graphics/mpesa-circular.png" alt="M-Pesa" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                  <p className="text-text-secondary mb-2">Amount to Pay:</p>
                  <p className="text-3xl font-bold text-primary">KSh {amount.toLocaleString()}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex justify-center items-center overflow-hidden mb-4 h-20">
                    <img src="/graphics/loading-colors.gif" className="h-60  object-cover" />
                  </div>
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
                    <AiOutlineCheckCircle className="text-success text-4xl mx-auto mb-2" />
                    <p className="text-text-primary font-medium">
                      An STK has been sent to your phone. Please Enter your PIN to complete the payment
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!amountSubmitted ? (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Amount to Pay (KSh)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                      required
                      className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                      disabled={loading}
                    />
                  </div>
                ) : (
                  !showStkSuccess && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Enter M-Pesa Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX... or 01XX..."
                        pattern="^0[17][0-9]{8}$"
                        title="Please enter a valid Safaricom number starting with 07 or 01"
                        required
                        className="w-full px-4 py-3 bg-bg-primary border-2 border-gray-400 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary-gold text-white rounded-lg font-bold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    `${!amountSubmitted ? "Continue" : !showStkSuccess ? "Pay Now" : "Resend STK"}`
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 bg-error/10 border border-error/30 rounded-lg p-3">
                  <p className="text-error text-center text-sm">{error}</p>
                </div>
              )}

              {showStkSuccess && (
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={paymentLoading}
                  className="w-full mt-4 px-4 py-3 border border-gray-400 text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover:text-white"
                >
                  {paymentLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    "Check Payment Status"
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="text-center">
              <AiOutlineCheckCircle className="text-success text-6xl mx-auto mb-4" />
              <p className="text-text-primary font-medium mb-2">Payment Successful!</p>
              <p className="text-text-secondary text-sm">Thank you for your payment. You will be redirected shortly.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
