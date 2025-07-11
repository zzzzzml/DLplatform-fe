import { defineStore } from 'pinia'
import { getExperimentList, getExperimentById } from '../api/experiment'

export const useExperimentStore = defineStore('experiment', {
  state: () => ({
    experiments: [],
    currentExperiment: null,
    loading: false,
    total: 0,
    page: 1,
    limit: 10
  }),

  actions: {
    async fetchExperiments(params = {}) {
      try {
        this.loading = true
        const { page = 1, limit = 10, ...rest } = params
        this.page = page
        this.limit = limit
        
        const res = await getExperimentList({ page, limit, ...rest })
        this.experiments = res.data
        this.total = res.total
        return res
      } catch (error) {
        console.error('Failed to fetch experiments:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchExperimentDetail(id) {
      try {
        this.loading = true
        const res = await getExperimentById(id)
        this.currentExperiment = res
        return res
      } catch (error) {
        console.error('Failed to fetch experiment detail:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    resetState() {
      this.experiments = []
      this.currentExperiment = null
      this.loading = false
      this.total = 0
      this.page = 1
      this.limit = 10
    }
  }
}) 