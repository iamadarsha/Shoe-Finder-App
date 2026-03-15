interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = 'Loading SoleMate...',
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#050507]">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl animate-pulse bg-gradient-to-br from-[#7C5CFC] to-[#00C896]" />
        <div className="absolute inset-0 w-16 h-16 rounded-2xl animate-ping opacity-20 bg-[#7C5CFC]" />
        <span className="absolute text-2xl">👟</span>
      </div>
      <p className="text-sm text-[#E8E8ED] font-body">{message}</p>
    </div>
  );
}
