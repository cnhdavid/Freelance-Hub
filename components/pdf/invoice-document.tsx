'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #8b5cf6',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    width: '30%',
  },
  value: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
    width: '70%',
    textAlign: 'right',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTop: '1px solid #e5e7eb',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 15,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
})

interface InvoiceDocumentProps {
  project: {
    id: string
    title: string
    description?: string
    budget: number
    created_at: string
    deadline?: string
    client?: {
      name: string
      email?: string
      company?: string
    }
  }
  invoiceNumber: string
  invoiceDate: string
}

export function InvoiceDocument({ project, invoiceNumber, invoiceDate }: InvoiceDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.subtitle}>Invoice #{invoiceNumber}</Text>
          <Text style={styles.subtitle}>Date: {invoiceDate}</Text>
        </View>

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project Name:</Text>
            <Text style={styles.value}>{project.title}</Text>
          </View>
          {project.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{project.description}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text>Completed</Text>
            </View>
          </View>
          {project.deadline && (
            <View style={styles.row}>
              <Text style={styles.label}>Completion Date:</Text>
              <Text style={styles.value}>
                {format(new Date(project.deadline), 'MMM dd, yyyy')}
              </Text>
            </View>
          )}
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client Name:</Text>
            <Text style={styles.value}>
              {project.client?.name || 'N/A'}
            </Text>
          </View>
          {project.client?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{project.client.email}</Text>
            </View>
          )}
          {project.client?.company && (
            <View style={styles.row}>
              <Text style={styles.label}>Company:</Text>
              <Text style={styles.value}>{project.client.company}</Text>
            </View>
          )}
        </View>

        {/* Financial Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project Budget:</Text>
            <Text style={styles.value}>
              ${project.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax Rate:</Text>
            <Text style={styles.value}>0%</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Total Amount Due:</Text>
            <Text style={styles.totalAmount}>
              ${project.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business! This invoice was generated automatically.</Text>
          <Text>Payment terms: Due upon receipt</Text>
        </View>
      </Page>
    </Document>
  )
}

interface InvoiceDownloadLinkProps {
  project: {
    id: string
    title: string
    description?: string
    budget: number
    created_at: string
    deadline?: string
    client?: {
      name: string
      email?: string
      company?: string
    }
  }
  className?: string
  children?: React.ReactNode
}

export function InvoiceDownloadLink({ project, className, children }: InvoiceDownloadLinkProps) {
  const invoiceNumber = `INV-${project.id?.slice(0, 8).toUpperCase() || '00000000'}`
  const invoiceDate = format(new Date(), 'MMM dd, yyyy')

  return (
    <PDFDownloadLink
      document={<InvoiceDocument project={project} invoiceNumber={invoiceNumber} invoiceDate={invoiceDate} />}
      fileName={`invoice-${project.title.toLowerCase().replace(/\s+/g, '-')}-${invoiceNumber}.pdf`}
      className={className}
    >
      {({ loading }) => (
        children || <span>{loading ? 'Generating PDF...' : 'Download Invoice'}</span>
      )}
    </PDFDownloadLink>
  )
}
