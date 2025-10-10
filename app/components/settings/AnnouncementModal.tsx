'use client'
import { useState } from 'react'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')

  const handleSubmit = () => {
    if (announcementText.trim() && announcementTitle.trim()) {
      // Duyuru verilerini localStorage'a kaydet
      const announcements = JSON.parse(localStorage.getItem('announcements') || '[]')
      const newAnnouncement = {
        id: Date.now(),
        title: announcementTitle,
        text: announcementText,
        date: new Date().toLocaleString('tr-TR'),
        read: false
      }
      announcements.push(newAnnouncement)
      localStorage.setItem('announcements', JSON.stringify(announcements))
      
      // Header'daki duyuru sayısını artır
      const currentCount = localStorage.getItem('announcementCount') || '0'
      const newCount = parseInt(currentCount) + 1
      localStorage.setItem('announcementCount', newCount.toString())
      
      alert('Duyuru başarıyla gönderildi!')
      setAnnouncementText('')
      setAnnouncementTitle('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Duyuru Gönder</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duyuru Başlığı
            </label>
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Duyuru başlığını girin..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duyuru Metni
            </label>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Duyuru metninizi buraya yazın..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            İptal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!announcementText.trim() || !announcementTitle.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  )
} 