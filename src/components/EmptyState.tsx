export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[82vh] w-full text-center text-muted-foreground text-sm">
      {message.split("\\n").map((line, i) => (
        <span key={i}>
          {line}
          <br />
        </span>
      ))}
    </div>
  );
}
