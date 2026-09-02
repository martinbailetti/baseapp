import { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CrudTable from '@/components/CrudTable'
import { useCrudResource } from '@/hooks/useCrudResource'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { DEFAULT_ACTORS_SORT } from '@/config/crudTableConfigs'
import { ActorModal } from '@/components/Actors/ActorModal'

export default function ActorsPage() {
  const { t } = useTranslation()
  const [modal,    setModal]    = useState(null)
  const refreshRef = useRef(null)
  const { save, remove } = useCrudResource('/api/actors')

  const columns = useMemo(() => [
    { key: 'id',          label: t('cinema.colId', 'ID'),            visible: false },
    { key: 'first_name',  label: t('cinema.colFirstName', 'Nombre')         },
    { key: 'last_name',   label: t('cinema.colLastName', 'Apellido')       },
    { key: 'stage_name',  label: t('cinema.colStageName', 'Nombre artístico') },
    { key: 'birth_year',  label: t('cinema.colBirthYear', 'Nacimiento')     },
    { key: 'death_year',  label: t('cinema.colDeathYear', 'Fallecimiento')  },
  ], [t])

  async function handleSave(form, id) {
    await save(form, id)
    setModal(null)
    refreshRef.current?.()
  }

  async function handleDelete(row) {
    await remove(row)
  }

  function renderCell(key, value) {
    if (value === null || value === undefined || value === '') return <span className="text-gray-300">—</span>
    return <span>{String(value)}</span>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CrudTable
        columns={columns}
        endpoint="/api/actors"
        storageKey={STORAGE_KEYS.ACTORS}
        title={t('cinema.actors', 'Actores')}
        onNew={() => setModal({ editing: null })}
        onEdit={row => setModal({ editing: row })}
        onDelete={handleDelete}
        refreshRef={refreshRef}
        defaultSortCriteria={DEFAULT_ACTORS_SORT}
        renderCell={renderCell}
      />

      {modal && (
        <ActorModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
