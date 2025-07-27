import { useState, useCallback } from 'react'

interface UseFetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseFetchReturn<T, P extends any[]> {
  data: T | null
  loading: boolean
  error: string | null
  fetchData: (...args: P) => Promise<T>
  setData: (data: T | null) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

const useFetch = <T, P extends any[]>(
  fetchFunction: (...args: P) => Promise<T>
): UseFetchReturn<T, P> => {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const fetchData = useCallback(
    async (...args: P): Promise<T> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const result = await fetchFunction(...args)
        setState(prev => ({ ...prev, data: result, loading: false }))
        return result
      } catch (error: any) {
        const errorMessage = error.message || '요청 처리 중 오류가 발생했습니다.'
        setState(prev => ({ ...prev, error: errorMessage, loading: false }))
        throw error
      }
    },
    [fetchFunction]
  )

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    fetchData,
    setData,
    setError,
    setLoading,
  }
}

export default useFetch