import { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CrudTable from '@/components/CrudTable'
import { useCrudResource } from '@/hooks/useCrudResource'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { DEFAULT_DIRECTORS_SORT } from '@/config/crudTableConfigs'
import { DirectorModal } from '@/components/Directors/DirectorModal'

export default function DirectorsPage() {
  const { t } = useTranslation()
  const [modal,    setModal]    = useState(null)
  const refreshRef = useRef(null)
  const { save, remove } = useCrudResource('/api/directors')

  const columns = useMemo(() => [
    { key: 'id',            label: t('cinema.colId', 'ID'),           visible: false },
    { key: 'first_name',    label: t('cinema.colFirstName', 'Nombre')        },
    { key: 'last_name',     label: t('cinema.colLastName', 'Apellido')      },
  ], [t])

  async function handleSave(form, id) {
    await save(form, id)
    setModal(null)
    refreshRef.current?.()
  }

  async function handleDelete(row) {
    await remove(row)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CrudTable
        columns={columns}
        endpoint="/api/directors"
        storageKey={STORAGE_KEYS.DIRECTORS}
        title={t('cinema.directors', 'Directores')}
        onNew={() => setModal({ editing: null })}
        onEdit={row => setModal({ editing: row })}
        onDelete={handleDelete}
        refreshRef={refreshRef}
        defaultSortCriteria={DEFAULT_DIRECTORS_SORT}
      />

      {modal && (
        <DirectorModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
