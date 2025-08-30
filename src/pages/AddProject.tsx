import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { addProject } from '@/api/projects';
import type { PostProjectRequest } from '@/api/projects';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const AddProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    generation: '',
    shortDescription: '',
    description: '',
    githubUrl: '',
    instagramUrl: '',
    etcUrl: '',
    isAlumni: false,
    isOfficial: false,
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCheckedChange = (name: 'isAlumni' | 'isOfficial', checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast({ variant: 'destructive', title: '오류', description: '프로젝트 이미지를 업로드해주세요.' });
      return;
    }
    const generationNumber = parseInt(formData.generation, 10);
    if (isNaN(generationNumber) || generationNumber <= 0) {
      toast({ variant: 'destructive', title: '오류', description: '기수는 1 이상의 숫자여야 합니다.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const requestData: PostProjectRequest = {
        serviceName: formData.serviceName.trim(),
        generation: generationNumber,
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        githubUrl: formData.githubUrl.trim() || null,
        instagramUrl: formData.instagramUrl.trim() || null,
        etcUrl: formData.etcUrl.trim() || null,
        image,
        isAlumni: formData.isAlumni,
        isOfficial: formData.isOfficial,
      };

      await addProject(requestData);
      toast({ title: '성공', description: '프로젝트가 성공적으로 추가되었습니다.' });
      navigate('/projects');

    } catch (err) {
      let errorMessage = '프로젝트 추가에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      }
      toast({ variant: 'destructive', title: '오류', description: errorMessage });
      console.error('Failed to add project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="프로젝트 추가">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="isAlumni" checked={formData.isAlumni} onCheckedChange={(checked) => handleCheckedChange('isAlumni', !!checked)} />
              <Label htmlFor="isAlumni">창업 중인 프로젝트</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isOfficial" checked={formData.isOfficial} onCheckedChange={(checked) => handleCheckedChange('isOfficial', !!checked)} />
              <Label htmlFor="isOfficial">공식 프로젝트</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="serviceName">서비스명 <span className="text-destructive">*</span></Label>
            <Input id="serviceName" name="serviceName" value={formData.serviceName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="generation">기수 <span className="text-destructive">*</span></Label>
            <Input type="number" id="generation" name="generation" value={formData.generation} onChange={handleChange} min={1} required />
          </div>
          <div>
            <Label htmlFor="image">이미지 <span className="text-destructive">*</span></Label>
            <Input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} required />
          </div>
          <div>
            <Label htmlFor="shortDescription">한 줄 설명 <span className="text-destructive">*</span></Label>
            <Input id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="description">세부 설명 <span className="text-destructive">*</span></Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} required />
          </div>
          <div>
            <Label htmlFor="githubUrl">깃허브 링크</Label>
            <Input id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/..." />
          </div>
          <div>
            <Label htmlFor="instagramUrl">인스타그램 링크</Label>
            <Input id="instagramUrl" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <Label htmlFor="etcUrl">기타 링크</Label>
            <Input id="etcUrl" name="etcUrl" value={formData.etcUrl} onChange={handleChange} />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/projects')} disabled={isSubmitting}>취소</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장하기
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddProject;