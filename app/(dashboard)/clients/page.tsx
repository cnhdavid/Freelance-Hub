import { ClientsPageClient } from './clients-client'
import { getClients } from '@/app/actions/clients'
import { cookies } from 'next/headers'

export default async function ClientsPage() {
  // Note: This is a server component, so we can't access localStorage
  // Guest data will be fetched client-side in the ClientsPageClient component
  const { data: clients, error } = await getClients()

  return <ClientsPageClient initialClients={clients || []} error={error} />
}
