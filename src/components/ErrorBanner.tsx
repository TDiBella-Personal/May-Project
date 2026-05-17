export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="error-banner" role="alert">
      <strong>Something went wrong:</strong> {message}
    </div>
  );
}
