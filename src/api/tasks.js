import api from './index'

export const tasksApi = {
  getAll(params = {}) {
    return api.get('/tasks', { params })
  },

  getOne(id) {
    return api.get(`/tasks/${id}`)
  },

  create(data) {
    return api.post('/tasks', data)
  },

  update(id, data) {
    return api.put(`/tasks/${id}`, data)
  },

  archive(id) {
    return api.patch(`/tasks/${id}`)
  },

  restore(id) {
    return api.patch(`/tasks/${id}/restore`)
  },
}
