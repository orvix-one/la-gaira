export default async function SucursalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Sucursal {id}</h1>
      <p className="mt-2 text-gray-600">TODO — Fase de UI</p>
    </main>
  );
}
