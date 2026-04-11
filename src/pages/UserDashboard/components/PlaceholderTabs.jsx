export default function PlaceholderTabs({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-brand-gold/40"></div>
      </div>
      <h3 className="text-2xl font-bold text-brand-dark">{title}</h3>
      <p className="text-text-light max-w-md">{description}</p>
      <div className="mt-4 px-6 py-3 rounded-lg bg-light-gray text-brand-dark font-semibold">
        Coming Soon
      </div>
    </div>
  )
}
