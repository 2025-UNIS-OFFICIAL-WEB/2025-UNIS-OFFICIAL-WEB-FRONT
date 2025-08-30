import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getProjectById, updateProject } from '@/api/projects';
import type { Project, PutProjectRequest } from '@/api/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditProject = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Omit<Project, 'projectId'> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const projectData = await getProjectById(projectId);
      setProject(projectData);
      setCurrentImageUrl(projectData.imageUrl);
    } catch {
      toast({
        variant: 'destructive',
        title: '에러',
        description: '프로젝트 정보를 불러오는 데 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !projectId) return;

    setIsSubmitting(true);
    try {
      const requestData: PutProjectRequest = {
        ...project,
        projectId: Number(projectId),
        generation: Number(project.generation),
        image: imageFile || undefined,
      };

      await updateProject(requestData);
      toast({ title: '성공', description: '프로젝트가 성공적으로 수정되었습니다.' });
      navigate('/projects');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: '수정 실패',
        description: err?.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Layout title="프로젝트 수정"><div className="text-center p-8">로딩 중...</div></Layout>;
  }

  if (!project) {
    return <Layout title="프로젝트 수정"><div className="text-center p-8">프로젝트를 찾을 수 없습니다.</div></Layout>;
  }

  return (
    <Layout title="프로젝트 수정">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAlumni"
            checked={project.isAlumni}
            onCheckedChange={(checked) => setProject({ ...project, isAlumni: !!checked })}
          />
          <Label htmlFor="isAlumni">창업 중인 프로젝트</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isOfficial"
            checked={project.isOfficial}
            onCheckedChange={(checked) => setProject({ ...project, isOfficial: !!checked })}
          />
          <Label htmlFor="isOfficial">공식 프로젝트</Label>
        </div>

        {/* 서비스명 */}
        <div>
          <Label htmlFor="serviceName">서비스명</Label>
          <Input id="serviceName" name="serviceName" value={project.serviceName} onChange={(e) => setProject({ ...project, serviceName: e.target.value })} />
        </div>

        {/* 이미지 업로드 */}
        <div>
          <Label htmlFor="image">이미지</Label>
          {currentImageUrl && !imageFile && (
            <img src={currentImageUrl} alt="Current Project" className="w-40 h-auto rounded-md my-2" />
          )}
          {imageFile && (
            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-40 h-auto rounded-md my-2" />
          )}
          <Input type="file" id="image" accept="image/*" onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])} />
        </div>

        {/* 한 줄 설명 */}
        <div>
          <Label htmlFor="shortDescription">한 줄 설명</Label>
          <Input id="shortDescription" name="shortDescription" value={project.shortDescription} onChange={(e) => setProject({ ...project, shortDescription: e.target.value })} />
        </div>

        {/* 세부 설명 */}
        <div>
          <Label htmlFor="description">세부 설명</Label>
          <Textarea id="description" name="description" value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} rows={5} />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => navigate('/projects')} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            수정하기
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default EditProject;