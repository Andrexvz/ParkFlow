<?php
$db = getDB();

$users = $db->query("SELECT * FROM `users` ORDER BY `role` ASC, `name` ASC")->fetchAll();
?>

<div class="space-y-6">
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Usuarios y Operadores de Turno</h1>
      <p class="text-xs text-slate-500 mt-0.5">Control de acceso, roles y asignación de horarios</p>
    </div>

    <!-- Botón modal nuevo usuario -->
    <button onclick="document.getElementById('newUserModal').classList.remove('hidden')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs">
      <i data-lucide="user-plus" class="w-4 h-4"></i>
      <span>Nuevo Operador</span>
    </button>
  </div>

  <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
          <tr>
            <th class="py-3 px-4">Nombre</th>
            <th class="py-3 px-4">Correo Electrónico</th>
            <th class="py-3 px-4">Rol</th>
            <th class="py-3 px-4">Turno Asignado</th>
            <th class="py-3 px-4">Estado</th>
            <th class="py-3 px-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <?php foreach ($users as $u): ?>
            <tr class="hover:bg-slate-50">
              <td class="py-3.5 px-4 font-bold text-slate-900">
                <?= htmlspecialchars($u['name']) ?>
              </td>
              <td class="py-3.5 px-4 text-slate-600 font-mono">
                <?= htmlspecialchars($u['email']) ?>
              </td>
              <td class="py-3.5 px-4">
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase <?= $u['role'] === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700' ?>">
                  <?= $u['role'] ?>
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-500">
                <?= htmlspecialchars($u['shift'] ?: 'Sin turno fijo') ?>
              </td>
              <td class="py-3.5 px-4">
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold <?= $u['active'] ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600' ?>">
                  <?= $u['active'] ? 'Activo' : 'Inactivo' ?>
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <form action="actions/users.php" method="POST" class="inline">
                  <input type="hidden" name="action" value="toggle_active">
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <button type="submit" class="px-2.5 py-1 text-[11px] font-semibold rounded hover:bg-slate-100 <?= $u['active'] ? 'text-amber-600' : 'text-emerald-600' ?>">
                    <?= $u['active'] ? 'Desactivar' : 'Activar' ?>
                  </button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Modal Nuevo Usuario -->
<div id="newUserModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
  <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <h3 class="font-bold text-slate-900 text-base">Crear Usuario / Operador</h3>
      <button onclick="document.getElementById('newUserModal').classList.add('hidden')" class="text-slate-400">✕</button>
    </div>
    <form action="actions/users.php" method="POST" class="space-y-3.5">
      <input type="hidden" name="action" value="create">
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
        <input type="text" name="name" required placeholder="Ej: Camilo Torres" class="w-full text-xs font-semibold px-3 py-2 border rounded-xl">
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
        <input type="email" name="email" required placeholder="correo@parkflow.co" class="w-full text-xs px-3 py-2 border rounded-xl">
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Rol *</label>
        <select name="role" class="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-white">
          <option value="OPERADOR">Operador de Parqueadero</option>
          <option value="ADMIN">Administrador del Sistema</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Horario / Turno</label>
        <select name="shift" class="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-white">
          <option value="Mañana (06:00 - 14:00)">Mañana (06:00 - 14:00)</option>
          <option value="Tarde (14:00 - 22:00)">Tarde (14:00 - 22:00)</option>
          <option value="Noche (22:00 - 06:00)">Noche (22:00 - 06:00)</option>
        </select>
      </div>
      <div class="pt-2 flex justify-end gap-2">
        <button type="button" onclick="document.getElementById('newUserModal').classList.add('hidden')" class="px-3 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">Crear Usuario</button>
      </div>
    </form>
  </div>
</div>
