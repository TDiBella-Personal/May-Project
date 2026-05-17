export function Loader({ message }: { message: string }) {
  return (
    <div className="loader">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}
