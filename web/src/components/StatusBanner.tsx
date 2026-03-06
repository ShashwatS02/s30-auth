type StatusBannerProps = {
  tone: "neutral" | "success" | "error";
  message: string;
};

export default function StatusBanner({
  tone,
  message,
}: StatusBannerProps) {
  if (!message.trim()) return null;

  return (
    <div className={`status-banner status-banner--${tone}`}>
      {message}
    </div>
  );
}
