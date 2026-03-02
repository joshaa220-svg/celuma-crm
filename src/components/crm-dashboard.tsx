"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { clientStatuses, contactChannels, providerTypes, responseStates } from "@/lib/crm";

type ProviderItem = {
  id: number;
  providerType: string;
  businessName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  zone: string | null;
  servicesOffered: string | null;
  avgPrice: number | null;
  initialResponse: string | null;
  hired: boolean;
  importantNotes: string | null;
  instagram?: string | null;
  website?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  specialConditions?: string | null;
  availableDays?: string | null;
  usualHours?: string | null;
  setupTime?: string | null;
  teardownTime?: string | null;
  technicalNeeds?: string | null;
  firstContactDate?: string | null;
  contactChannel?: string | null;
  relationshipType?: string | null;
  agreedConditions?: string | null;
  professionalism?: number | null;
  communication?: number | null;
  punctuality?: number | null;
  serviceQuality?: number | null;
  flexibility?: number | null;
  valueForMoney?: number | null;
  globalRating?: number | null;
  followUp?: boolean;
};

type ClientItem = {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  eventType: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  guestCount: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  status: string;
  source: string | null;
  assignedProviderType: string | null;
  notes: string | null;
};

type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableTypes?: string[];
};

type SessionUser = {
  id: number;
  email: string;
  role: "ADMIN" | "AGENT";
};

type TaskItem = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: number;
};

type NoteItem = {
  id: number;
  content: string;
  channel: string | null;
  createdAt: string;
  createdBy: {
    email: string;
    name: string | null;
  };
};

const PAGE_SIZE = 30;

export function CrmDashboard({ currentUser }: { currentUser: SessionUser }) {
  const [tab, setTab] = useState<"providers" | "clients" | "tasks">("providers");
  const [providerTypeOptions, setProviderTypeOptions] = useState<string[]>([]);
  const [providerTypeSelection, setProviderTypeSelection] = useState<string>(providerTypes[0]);
  const [newProviderType, setNewProviderType] = useState("");

  const [providerSearch, setProviderSearch] = useState("");
  const [providerTypeFilter, setProviderTypeFilter] = useState("");
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [providerPage, setProviderPage] = useState(1);
  const [providerTotalPages, setProviderTotalPages] = useState(1);
  const [providerTotal, setProviderTotal] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [providerFormKey, setProviderFormKey] = useState(0);

  const [clientSearch, setClientSearch] = useState("");
  const [clientStatusFilter, setClientStatusFilter] = useState("");
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [clientPage, setClientPage] = useState(1);
  const [clientTotalPages, setClientTotalPages] = useState(1);
  const [clientTotal, setClientTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [clientFormKey, setClientFormKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskFormKey, setTaskFormKey] = useState(0);
  const [taskFilter, setTaskFilter] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteChannel, setNoteChannel] = useState("");

  const providerQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (providerSearch) params.set("search", providerSearch);
    if (providerTypeFilter) params.set("providerType", providerTypeFilter);
    return params.toString();
  }, [providerSearch, providerTypeFilter]);

  const clientQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (clientSearch) params.set("search", clientSearch);
    if (clientStatusFilter) params.set("status", clientStatusFilter);
    return params.toString();
  }, [clientSearch, clientStatusFilter]);

  async function loadProviders() {
    const response = await fetch(`/api/providers?${providerQuery}&page=${providerPage}&pageSize=${PAGE_SIZE}`);
    const data = (await response.json()) as PaginatedResponse<ProviderItem>;
    setProviders(data.items);
    setProviderTotalPages(data.totalPages);
    setProviderTotal(data.total);
    setProviderTypeOptions(data.availableTypes?.filter(Boolean) ?? []);
  }

  async function loadClients() {
    const response = await fetch(`/api/clients?${clientQuery}&page=${clientPage}&pageSize=${PAGE_SIZE}`);
    const data = (await response.json()) as PaginatedResponse<ClientItem>;
    setClients(data.items);
    setClientTotalPages(data.totalPages);
    setClientTotal(data.total);
  }

  const loadTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (taskFilter) params.set("status", taskFilter);
    const response = await fetch(`/api/tasks?${params.toString()}`);
    const data = (await response.json()) as TaskItem[];
    setTasks(data);
  }, [taskFilter]);

  const loadNotes = useCallback(async (entityType: "PROVIDER" | "CLIENT", entityId: number) => {
    const response = await fetch(`/api/notes?entityType=${entityType}&entityId=${entityId}`);
    const data = (await response.json()) as NoteItem[];
    setNotes(data);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function handleBackup() {
    const response = await fetch("/api/admin/backup", { method: "POST" });
    if (!response.ok) {
      setMessage("No se pudo generar copia de seguridad.");
      return;
    }
    const result = (await response.json()) as { file: string };
    setMessage(`Copia de seguridad creada: ${result.file}`);
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/tasks", { method: "POST", body: formData });
    setLoading(false);
    if (!response.ok) {
      setMessage("No se pudo crear la tarea.");
      return;
    }
    setTaskFormKey((value) => value + 1);
    setMessage("Tarea creada.");
    await loadTasks();
  }

  async function updateTaskStatus(taskId: number, status: TaskItem["status"]) {
    const formData = new FormData();
    formData.set("status", status);
    const response = await fetch(`/api/tasks/${taskId}`, { method: "PUT", body: formData });
    if (!response.ok) {
      setMessage("No se pudo actualizar la tarea.");
      return;
    }
    await loadTasks();
  }

  async function submitNote() {
    const targetProvider = tab === "providers" ? selectedProvider : null;
    const targetClient = tab === "clients" ? selectedClient : null;

    if (!noteText.trim()) {
      return;
    }

    if (!targetProvider && !targetClient) {
      setMessage("Selecciona un proveedor o cliente para registrar comunicación.");
      return;
    }

    const formData = new FormData();
    if (targetProvider) {
      formData.set("entityType", "PROVIDER");
      formData.set("entityId", String(targetProvider.id));
    } else if (targetClient) {
      formData.set("entityType", "CLIENT");
      formData.set("entityId", String(targetClient.id));
    }
    formData.set("content", noteText.trim());
    if (noteChannel) formData.set("channel", noteChannel);

    const response = await fetch("/api/notes", { method: "POST", body: formData });
    if (!response.ok) {
      setMessage("No se pudo guardar la comunicación.");
      return;
    }

    setNoteText("");
    setNoteChannel("");
    if (targetProvider) await loadNotes("PROVIDER", targetProvider.id);
    if (targetClient) await loadNotes("CLIENT", targetClient.id);
  }

  const availableProviderTypes = useMemo(() => {
    const set = new Set<string>([...providerTypes, ...providerTypeOptions]);
    if (selectedProvider?.providerType) {
      set.add(selectedProvider.providerType);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [providerTypeOptions, selectedProvider]);

  useEffect(() => {
    let active = true;
    fetch(`/api/providers?${providerQuery}&page=${providerPage}&pageSize=${PAGE_SIZE}`)
      .then((response) => response.json())
      .then((data: PaginatedResponse<ProviderItem>) => {
        if (active) {
          setProviders(data.items);
          setProviderTotalPages(data.totalPages);
          setProviderTotal(data.total);
          setProviderTypeOptions(data.availableTypes?.filter(Boolean) ?? []);
        }
      });

    return () => {
      active = false;
    };
  }, [providerPage, providerQuery]);

  useEffect(() => {
    let active = true;
    fetch(`/api/clients?${clientQuery}&page=${clientPage}&pageSize=${PAGE_SIZE}`)
      .then((response) => response.json())
      .then((data: PaginatedResponse<ClientItem>) => {
        if (active) {
          setClients(data.items);
          setClientTotalPages(data.totalPages);
          setClientTotal(data.total);
        }
      });

    return () => {
      active = false;
    };
  }, [clientPage, clientQuery]);

  // Load tasks when tab changes
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    let isMounted = true;
    if (tab === "tasks") {
      loadTasks()
        .then(() => {
          if (!isMounted) return;
        })
        .catch(console.error);
    }
    return () => {
      isMounted = false;
    };
  }, [tab, loadTasks]);

  // Load notes for selected entity
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    let isMounted = true;
    if (tab === "providers" && selectedProvider) {
      loadNotes("PROVIDER", selectedProvider.id)
        .then(() => {
          if (!isMounted) return;
        })
        .catch(console.error);
      return;
    }
    if (tab === "clients" && selectedClient) {
      loadNotes("CLIENT", selectedClient.id)
        .then(() => {
          if (!isMounted) return;
        })
        .catch(console.error);
      return;
    }
    setNotes([]);
    return () => {
      isMounted = false;
    };
  }, [tab, selectedProvider, selectedClient, loadNotes]);

  async function handleProviderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const resolvedProviderType =
      providerTypeSelection === "__new__" ? newProviderType.trim() : providerTypeSelection;

    if (!resolvedProviderType) {
      setLoading(false);
      setMessage("Debes indicar un tipo de proveedor.");
      return;
    }

    formData.set("providerType", resolvedProviderType);
    const method = selectedProvider ? "PUT" : "POST";
    const endpoint = selectedProvider ? `/api/providers/${selectedProvider.id}` : "/api/providers";

    const response = await fetch(endpoint, { method, body: formData });
    setLoading(false);

    if (!response.ok) {
      setMessage("No se pudo guardar el proveedor.");
      return;
    }

    setSelectedProvider(null);
    setProviderFormKey((value) => value + 1);
    setProviderTypeSelection(providerTypes[0]);
    setNewProviderType("");
    setMessage(selectedProvider ? "Proveedor actualizado." : "Proveedor creado.");
    await loadProviders();
  }

  async function handleClientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const method = selectedClient ? "PUT" : "POST";
    const endpoint = selectedClient ? `/api/clients/${selectedClient.id}` : "/api/clients";

    const response = await fetch(endpoint, { method, body: formData });
    setLoading(false);

    if (!response.ok) {
      setMessage("No se pudo guardar el cliente.");
      return;
    }

    setSelectedClient(null);
    setClientFormKey((value) => value + 1);
    setMessage(selectedClient ? "Cliente actualizado." : "Cliente creado.");
    await loadClients();
  }

  async function removeProvider(id: number) {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    await fetch(`/api/providers/${id}`, { method: "DELETE" });
    await loadProviders();
  }

  async function removeClient(id: number) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    await loadClients();
  }

  async function importProvidersCsv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/providers/import", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    if (!response.ok) {
      setMessage("Error al importar CSV.");
      return;
    }

    const result = (await response.json()) as { imported: number };
    setMessage(`Importación completada: ${result.imported} proveedores.`);
    await loadProviders();
  }

  return (
    <div className="crm-shell">
      <header className="crm-card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/celuma_light.png" alt="Celuma" width={120} height={38} priority />
            <div>
              <h1 className="crm-title text-3xl">CRM Celuma</h1>
              <p className="text-sm text-slate-500">Gestión local de clientes y proveedores</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="crm-btn crm-btn-ghost" onClick={() => setTab("providers")}>
              Proveedores
            </button>
            <button className="crm-btn crm-btn-ghost" onClick={() => setTab("clients")}>
              Clientes
            </button>
            <button className="crm-btn crm-btn-ghost" onClick={() => setTab("tasks")}>
              Tareas
            </button>
            {currentUser.role === "ADMIN" ? (
              <button className="crm-btn crm-btn-soft" onClick={() => void handleBackup()}>
                Backup
              </button>
            ) : null}
            <span className="text-xs text-slate-500">{currentUser.email}</span>
            <button className="crm-btn crm-btn-soft" onClick={() => void handleLogout()}>
              Salir
            </button>
          </div>
        </div>
      </header>

      {message ? (
        <div className="crm-card" style={{ padding: 12, marginBottom: 16, color: "#3e6169" }}>
          {message}
        </div>
      ) : null}

      {tab === "providers" ? (
        <section className="crm-grid">
          <article className="crm-card col-span-12 lg:col-span-4" style={{ padding: 16 }}>
            <h2 className="crm-title text-xl mb-3">{selectedProvider ? "Editar proveedor" : "Nuevo proveedor"}</h2>
            <form key={providerFormKey} onSubmit={handleProviderSubmit} className="space-y-3">
              <Field label="Tipo">
                <select className="crm-select" value={providerTypeSelection} onChange={(event) => setProviderTypeSelection(event.target.value)}>
                  {availableProviderTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="__new__">Crear nuevo tipo...</option>
                </select>
              </Field>
              {providerTypeSelection === "__new__" ? (
                <Field label="Nuevo tipo de proveedor">
                  <input
                    className="crm-input"
                    placeholder="Ejemplo: Iluminación"
                    value={newProviderType}
                    onChange={(event) => setNewProviderType(event.target.value)}
                    required
                  />
                </Field>
              ) : null}
              <Field label="Nombre comercial">
                <input className="crm-input" name="businessName" defaultValue={selectedProvider?.businessName ?? ""} required />
              </Field>
              <Field label="Contacto">
                <input className="crm-input" name="contactName" defaultValue={selectedProvider?.contactName ?? ""} />
              </Field>
              <Field label="Teléfono">
                <input className="crm-input" name="phone" defaultValue={selectedProvider?.phone ?? ""} />
              </Field>
              <Field label="Email">
                <input className="crm-input" name="email" defaultValue={selectedProvider?.email ?? ""} />
              </Field>
              <Field label="Zona">
                <input className="crm-input" name="zone" defaultValue={selectedProvider?.zone ?? ""} />
              </Field>
              <Field label="Servicios">
                <input className="crm-input" name="servicesOffered" defaultValue={selectedProvider?.servicesOffered ?? ""} />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Mínimo">
                  <input className="crm-input" name="minPrice" defaultValue={selectedProvider?.minPrice ?? ""} />
                </Field>
                <Field label="Medio">
                  <input className="crm-input" name="avgPrice" defaultValue={selectedProvider?.avgPrice ?? ""} />
                </Field>
                <Field label="Máximo">
                  <input className="crm-input" name="maxPrice" defaultValue={selectedProvider?.maxPrice ?? ""} />
                </Field>
              </div>
              <Field label="Vía contacto">
                <select className="crm-select" name="contactChannel" defaultValue={selectedProvider?.contactChannel ?? ""}>
                  <option value="">-</option>
                  {contactChannels.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Respuesta inicial">
                <select className="crm-select" name="initialResponse" defaultValue={selectedProvider?.initialResponse ?? ""}>
                  <option value="">-</option>
                  {responseStates.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Notas">
                <textarea className="crm-textarea" name="importantNotes" rows={3} defaultValue={selectedProvider?.importantNotes ?? ""} />
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="hired" defaultChecked={selectedProvider?.hired ?? false} />
                Contratado
              </label>
              <div className="flex gap-2">
                <button className="crm-btn crm-btn-primary" type="submit" disabled={loading}>
                  {selectedProvider ? "Actualizar" : "Crear"}
                </button>
                <button
                  className="crm-btn crm-btn-soft"
                  type="button"
                  onClick={() => {
                    setSelectedProvider(null);
                    setProviderFormKey((value) => value + 1);
                    setProviderTypeSelection(providerTypes[0]);
                    setNewProviderType("");
                  }}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </article>

          <article className="crm-card col-span-12 lg:col-span-8" style={{ padding: 16 }}>
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="min-w-56 flex-1">
                <div className="crm-label">Buscar por nombre, zona, email, servicios...</div>
                <input
                  className="crm-input"
                  value={providerSearch}
                  onChange={(e) => {
                    setProviderSearch(e.target.value);
                    setProviderPage(1);
                  }}
                />
              </div>
              <div className="min-w-48">
                <div className="crm-label">Tipo proveedor</div>
                <select
                  className="crm-select"
                  value={providerTypeFilter}
                  onChange={(e) => {
                    setProviderTypeFilter(e.target.value);
                    setProviderPage(1);
                  }}
                >
                  <option value="">Todos</option>
                  {availableProviderTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={importProvidersCsv} className="flex flex-wrap items-end gap-2 mb-4">
              <div className="flex-1 min-w-56">
                <div className="crm-label">Importar proveedores desde CSV</div>
                <input className="crm-input" type="file" name="file" accept=".csv" required />
              </div>
              <button className="crm-btn crm-btn-soft" type="submit" disabled={loading}>
                Importar CSV
              </button>
            </form>

            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-2">Tipo</th>
                    <th className="py-2 pr-2">Proveedor</th>
                    <th className="py-2 pr-2">Contacto</th>
                    <th className="py-2 pr-2">Zona</th>
                    <th className="py-2 pr-2">Precio medio</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">{provider.providerType}</td>
                      <td className="py-2 pr-2 font-semibold text-slate-700">{provider.businessName}</td>
                      <td className="py-2 pr-2">{provider.contactName || provider.phone || "-"}</td>
                      <td className="py-2 pr-2">{provider.zone || "-"}</td>
                      <td className="py-2 pr-2">{provider.avgPrice ? `${provider.avgPrice}€` : "-"}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="crm-btn crm-btn-ghost"
                            onClick={() => {
                              setSelectedProvider(provider);
                              setProviderFormKey((value) => value + 1);
                              setProviderTypeSelection(provider.providerType);
                              setNewProviderType("");
                            }}
                          >
                            Editar
                          </button>
                          <button type="button" className="crm-btn crm-btn-soft" onClick={() => void removeProvider(provider.id)}>
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{providerTotal} resultados</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="crm-btn crm-btn-ghost"
                  disabled={providerPage <= 1}
                  onClick={() => setProviderPage((value) => Math.max(1, value - 1))}
                >
                  Anterior
                </button>
                <span>
                  Página {providerPage} de {providerTotalPages}
                </span>
                <button
                  type="button"
                  className="crm-btn crm-btn-ghost"
                  disabled={providerPage >= providerTotalPages}
                  onClick={() => setProviderPage((value) => Math.min(providerTotalPages, value + 1))}
                >
                  Siguiente
                </button>
              </div>
            </div>

            {selectedProvider ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="crm-title text-lg">Comunicaciones: {selectedProvider.businessName}</h3>
                <div className="mt-2 grid gap-2">
                  <input
                    className="crm-input"
                    placeholder="Canal (email, llamada, whatsapp...)"
                    value={noteChannel}
                    onChange={(event) => setNoteChannel(event.target.value)}
                  />
                  <textarea
                    className="crm-textarea"
                    placeholder="Resumen de la conversación"
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    rows={3}
                  />
                  <div>
                    <button className="crm-btn crm-btn-primary" type="button" onClick={() => void submitNote()}>
                      Guardar comunicación
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="rounded-xl border border-slate-100 px-3 py-2 text-sm">
                        <div className="text-slate-500">
                          {note.channel || "Sin canal"} · {new Date(note.createdAt).toLocaleString("es-ES")} · {note.createdBy.name || note.createdBy.email}
                        </div>
                        <div className="text-slate-700">{note.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        </section>
      ) : tab === "clients" ? (
        <section className="crm-grid">
          <article className="crm-card col-span-12 lg:col-span-4" style={{ padding: 16 }}>
            <h2 className="crm-title text-xl mb-3">{selectedClient ? "Editar cliente" : "Nuevo cliente"}</h2>
            <form key={clientFormKey} onSubmit={handleClientSubmit} className="space-y-3">
              <Field label="Nombre completo">
                <input className="crm-input" name="fullName" defaultValue={selectedClient?.fullName ?? ""} required />
              </Field>
              <Field label="Teléfono">
                <input className="crm-input" name="phone" defaultValue={selectedClient?.phone ?? ""} />
              </Field>
              <Field label="Email">
                <input className="crm-input" name="email" defaultValue={selectedClient?.email ?? ""} />
              </Field>
              <Field label="Tipo evento">
                <input className="crm-input" name="eventType" defaultValue={selectedClient?.eventType ?? ""} />
              </Field>
              <Field label="Fecha evento">
                <input
                  className="crm-input"
                  type="date"
                  name="eventDate"
                  defaultValue={selectedClient?.eventDate ? selectedClient.eventDate.slice(0, 10) : ""}
                />
              </Field>
              <Field label="Ubicación evento">
                <input className="crm-input" name="eventLocation" defaultValue={selectedClient?.eventLocation ?? ""} />
              </Field>
              <Field label="Estado">
                <select className="crm-select" name="status" defaultValue={selectedClient?.status ?? "Lead"}>
                  {clientStatuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Notas">
                <textarea className="crm-textarea" name="notes" rows={3} defaultValue={selectedClient?.notes ?? ""} />
              </Field>
              <div className="flex gap-2">
                <button className="crm-btn crm-btn-primary" type="submit" disabled={loading}>
                  {selectedClient ? "Actualizar" : "Crear"}
                </button>
                <button
                  className="crm-btn crm-btn-soft"
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setClientFormKey((value) => value + 1);
                  }}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </article>

          <article className="crm-card col-span-12 lg:col-span-8" style={{ padding: 16 }}>
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="min-w-56 flex-1">
                <div className="crm-label">Buscar por nombre, contacto o evento</div>
                <input
                  className="crm-input"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setClientPage(1);
                  }}
                />
              </div>
              <div className="min-w-48">
                <div className="crm-label">Estado</div>
                <select
                  className="crm-select"
                  value={clientStatusFilter}
                  onChange={(e) => {
                    setClientStatusFilter(e.target.value);
                    setClientPage(1);
                  }}
                >
                  <option value="">Todos</option>
                  {clientStatuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-2">Cliente</th>
                    <th className="py-2 pr-2">Contacto</th>
                    <th className="py-2 pr-2">Evento</th>
                    <th className="py-2 pr-2">Estado</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2 font-semibold text-slate-700">{client.fullName}</td>
                      <td className="py-2 pr-2">{client.phone || client.email || "-"}</td>
                      <td className="py-2 pr-2">{client.eventType || "-"}</td>
                      <td className="py-2 pr-2">{client.status}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="crm-btn crm-btn-ghost"
                            onClick={() => {
                              setSelectedClient(client);
                              setClientFormKey((value) => value + 1);
                            }}
                          >
                            Editar
                          </button>
                          <button type="button" className="crm-btn crm-btn-soft" onClick={() => void removeClient(client.id)}>
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{clientTotal} resultados</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="crm-btn crm-btn-ghost"
                  disabled={clientPage <= 1}
                  onClick={() => setClientPage((value) => Math.max(1, value - 1))}
                >
                  Anterior
                </button>
                <span>
                  Página {clientPage} de {clientTotalPages}
                </span>
                <button
                  type="button"
                  className="crm-btn crm-btn-ghost"
                  disabled={clientPage >= clientTotalPages}
                  onClick={() => setClientPage((value) => Math.min(clientTotalPages, value + 1))}
                >
                  Siguiente
                </button>
              </div>
            </div>

            {selectedClient ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="crm-title text-lg">Comunicaciones: {selectedClient.fullName}</h3>
                <div className="mt-2 grid gap-2">
                  <input
                    className="crm-input"
                    placeholder="Canal (email, llamada, whatsapp...)"
                    value={noteChannel}
                    onChange={(event) => setNoteChannel(event.target.value)}
                  />
                  <textarea
                    className="crm-textarea"
                    placeholder="Resumen de la conversación"
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    rows={3}
                  />
                  <div>
                    <button className="crm-btn crm-btn-primary" type="button" onClick={() => void submitNote()}>
                      Guardar comunicación
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="rounded-xl border border-slate-100 px-3 py-2 text-sm">
                        <div className="text-slate-500">
                          {note.channel || "Sin canal"} · {new Date(note.createdAt).toLocaleString("es-ES")} · {note.createdBy.name || note.createdBy.email}
                        </div>
                        <div className="text-slate-700">{note.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        </section>
      ) : (
        <section className="crm-grid">
          <article className="crm-card col-span-12 lg:col-span-4" style={{ padding: 16 }}>
            <h2 className="crm-title text-xl mb-3">Nueva tarea</h2>
            <form key={taskFormKey} onSubmit={handleTaskSubmit} className="space-y-3">
              <Field label="Título">
                <input className="crm-input" name="title" required />
              </Field>
              <Field label="Descripción">
                <textarea className="crm-textarea" name="description" rows={3} />
              </Field>
              <Field label="Fecha límite">
                <input className="crm-input" type="date" name="dueDate" />
              </Field>
              <Field label="Prioridad (1-3)">
                <select className="crm-select" name="priority" defaultValue="2">
                  <option value="1">Alta</option>
                  <option value="2">Media</option>
                  <option value="3">Baja</option>
                </select>
              </Field>
              <button className="crm-btn crm-btn-primary" type="submit" disabled={loading}>
                Crear tarea
              </button>
            </form>
          </article>

          <article className="crm-card col-span-12 lg:col-span-8" style={{ padding: 16 }}>
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="min-w-56">
                <div className="crm-label">Estado</div>
                <select className="crm-select" value={taskFilter} onChange={(event) => setTaskFilter(event.target.value)}>
                  <option value="">Todos</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En curso</option>
                  <option value="DONE">Hecha</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-100 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-700">{task.title}</div>
                      <div className="text-sm text-slate-500">
                        {task.description || "Sin descripción"}
                        {task.dueDate ? ` · Vence ${new Date(task.dueDate).toLocaleDateString("es-ES")}` : ""}
                      </div>
                    </div>
                    <select
                      className="crm-select"
                      value={task.status}
                      onChange={(event) => void updateTaskStatus(task.id, event.target.value as TaskItem["status"])}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="IN_PROGRESS">En curso</option>
                      <option value="DONE">Hecha</option>
                      <option value="CANCELLED">Cancelada</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="crm-label">{label}</div>
      {children}
    </div>
  );
}
