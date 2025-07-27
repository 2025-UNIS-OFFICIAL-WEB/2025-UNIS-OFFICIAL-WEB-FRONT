import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'

interface ProjectItemProps {
  projectId: number
  serviceName: string
  generation: number
  shortDescription: string
  onDelete: (id: number) => void
  disabled?: boolean // 삭제 중일 때 버튼 비활성화
}

const ProjectListItem = ({
  projectId,
  serviceName,
  generation,
  shortDescription,
  onDelete,
  disabled = false,
}: ProjectItemProps) => {
  const navigate = useNavigate()

  const handleDelete = () => {
    if (disabled) {
      console.log('⚠️ Delete action disabled, ignoring click')
      return
    }

    const confirmed = window.confirm(`"${serviceName}" 프로젝트를 정말 삭제하시겠습니까?`)
    if (confirmed) {
      console.log('🗑️ [ProjectListItem] User confirmed deletion for:', { projectId, serviceName })
      onDelete(projectId)
    }
  }

  const handleEdit = () => {
    if (disabled) {
      console.log('⚠️ Edit action disabled, ignoring click')
      return
    }
    
    console.log('✏️ [ProjectListItem] Navigating to edit page for project:', projectId)
    navigate(`/editProject/${projectId}`)
  }

  return (
    <div className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center flex-1 min-w-0 mr-4 space-x-4">
        <span className="font-bold text-lg flex-shrink-0">{serviceName}</span>
        <span className="text-sm text-gray-500 flex-shrink-0">{generation}기</span>
        <span className="text-sm text-gray-600 truncate">{shortDescription}</span>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={disabled}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          {disabled ? '삭제 중...' : '삭제'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          disabled={disabled}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" />
          편집
        </Button>
      </div>
    </div>
  )
}

export default ProjectListItem