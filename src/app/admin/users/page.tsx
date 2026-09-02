import { getUsersList } from '@/actions/admin.actions';

export default async function AdminUsersPage() {
  const usersList = await getUsersList();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline-lg text-headline-lg text-primary">AUDITORÍA DE CLIENTES</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Listado de usuarios registrados en el sistema y auditoría de sus cuentas.</p>
        </div>
      </div>

      {usersList.length === 0 ? (
        <div className="p-8 bg-surface border border-white/5 rounded-xl shadow-lg flex items-center justify-center min-h-[300px]">
          <span className="text-on-surface-variant font-body-md">No hay clientes registrados en el sistema.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface border border-white/5 rounded-xl shadow-lg">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-on-surface-variant font-label-md">
                <th className="p-4">Nombre</th>
                <th className="p-4">Email</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body-md text-on-surface">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-semibold">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4">
                    {new Date(user.createdAt).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
