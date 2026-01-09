import { ClientsPageClient } from './clients-client'
import { getClients } from '@/app/actions/clients'

export default async function ClientsPage() {
  const { data: clients, error } = await getClients()

  return <ClientsPageClient initialClients={clients || []} error={error} />
}
