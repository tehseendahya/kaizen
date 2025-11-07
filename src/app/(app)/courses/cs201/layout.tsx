/**
 * CS201 Course Layout
 * 
 * Authentication temporarily disabled for development
 */

export default async function CS201Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication disabled - anyone can access for now
  return <>{children}</>;
}
