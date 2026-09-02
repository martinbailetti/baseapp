import { describe, it, expect } from 'vitest'
import {
  initVisibility,
  initColOrder,
  normalizeSortCriteria,
  initSortCriteria,
  appendSortCriteriaParams,
} from '@/components/CrudTable/helpers'

const columns = [
  { key: 'id', visible: true },
  { key: 'name', visible: true },
  { key: 'hidden', visible: false },
]

describe('CrudTable helpers', () => {
  describe('initVisibility', () => {
    it('usa visible por defecto de cada columna', () => {
      expect(initVisibility(columns, {})).toEqual({
        id: true,
        name: true,
        hidden: false,
      })
    })

    it('respeta preferencias guardadas', () => {
      expect(
        initVisibility(columns, { visibility: { name: false, hidden: true } })
      ).toEqual({
        id: true,
        name: false,
        hidden: true,
      })
    })
  })

  describe('initColOrder', () => {
    it('devuelve todas las claves si no hay orden guardado', () => {
      expect(initColOrder(columns, {})).toEqual(['id', 'name', 'hidden'])
    })

    it('conserva orden guardado y añade columnas nuevas al final', () => {
      expect(
        initColOrder(columns, { colOrder: ['name', 'id'] })
      ).toEqual(['name', 'id', 'hidden'])
    })

    it('ignora claves guardadas que ya no existen', () => {
      expect(
        initColOrder(columns, { colOrder: ['removed', 'name'] })
      ).toEqual(['name', 'id', 'hidden'])
    })
  })

  describe('normalizeSortCriteria', () => {
    it('elimina duplicados y columnas no permitidas', () => {
      expect(
        normalizeSortCriteria(
          [{ key: 'name', dir: 'desc' }, { key: 'name', dir: 'asc' }, { key: 'missing', dir: 'asc' }],
          ['id', 'name']
        )
      ).toEqual([{ key: 'name', dir: 'desc' }])
    })
  })

  describe('initSortCriteria', () => {
    it('restaura sortCriteria guardado', () => {
      expect(
        initSortCriteria(columns, { sortCriteria: [{ key: 'name', dir: 'desc' }] }, [{ key: 'id', dir: 'asc' }])
      ).toEqual([{ key: 'name', dir: 'desc' }])
    })

    it('hace fallback a sortBy/sortDir legacy', () => {
      expect(
        initSortCriteria(columns, { sortBy: 'name', sortDir: 'desc' }, [])
      ).toEqual([{ key: 'name', dir: 'desc' }])
    })
  })

  describe('appendSortCriteriaParams', () => {
    it('envía sort[] y direction[] al API', () => {
      const params = new URLSearchParams()
      appendSortCriteriaParams(
        params,
        [{ key: 'name', dir: 'asc' }, { key: 'id', dir: 'desc' }],
        ['id', 'name']
      )
      expect(params.getAll('sort[]')).toEqual(['name', 'id'])
      expect(params.getAll('direction[]')).toEqual(['asc', 'desc'])
    })
  })
})
