import { useEffect, useState } from 'react'
import { DIFFICULTIES } from '../game/constants'
import type { LeaderboardEntry } from '../game/leaderboard'
import { formatElapsedTime } from '../game/leaderboard'

const PAGE_SIZE = 10

type LeaderboardDialogProps = {
  entries: LeaderboardEntry[]
  error: string | null
  onClose: () => void
}

export function LeaderboardDialog({ entries, error, onClose }: LeaderboardDialogProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const pageEntries = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages - 1))
  }, [totalPages])

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal leaderboard-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-title"
      >
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">LOCAL RECORDS</span>
            <h2 id="leaderboard-title">排行榜</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="关闭排行榜">
            ×
          </button>
        </div>

        {error ? (
          <p className="empty-state">{error}</p>
        ) : entries.length === 0 ? (
          <p className="empty-state">暂时没有通关记录。</p>
        ) : (
          <>
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th scope="col">排名</th>
                    <th scope="col">难度</th>
                    <th scope="col">用时</th>
                    <th scope="col">完成时间（UTC+8）</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEntries.map((entry, index) => (
                    <tr key={entry.id}>
                      <td>{page * PAGE_SIZE + index + 1}</td>
                      <td>{DIFFICULTIES[entry.difficulty].label}</td>
                      <td>{formatElapsedTime(entry.elapsedSeconds)}</td>
                      <td>{entry.completedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination" aria-label="排行榜分页">
              <button
                className="pagination-button"
                type="button"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={page === 0}
              >
                上一页
              </button>
              <span>第 {page + 1} / {totalPages} 页</span>
              <button
                className="pagination-button"
                type="button"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={page === totalPages - 1}
              >
                下一页
              </button>
            </div>
          </>
        )}

        <div className="modal-actions modal-actions--end">
          <button className="button button--secondary" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
      </section>
    </div>
  )
}
