import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  JIUYIN_TEMPLATE_CATEGORIES,
  type JiuYinTemplateCategory,
  type JiuYinTemplateLibrarySummary,
  type JiuYinTemplateMatchReport,
} from '../../shared/jiuyin-stage2.ts';
import { toast } from '../components/toast/toast-core.ts';

const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background:
    radial-gradient(circle at 18% 14%, rgba(245, 158, 11, 0.16), transparent 24rem),
    radial-gradient(circle at 88% 18%, rgba(102, 204, 255, 0.18), transparent 28rem),
    linear-gradient(145deg, #f9fbf8 0%, #eef6f4 54%, #f7f1e8 100%);
  color: ${props => props.theme.colors.text};
`;

const Header = styled.section`
  max-width: 1180px;
  margin: 0 auto 1.25rem;
  padding: 1.75rem;
  border-radius: 24px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 22px 60px rgba(37, 60, 80, 0.12);
`;

const Eyebrow = styled.div`
  color: #b26b00;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 0.65rem;
`;

const Title = styled.h1`
  margin: 0;
  color: #1f2a37;
  font-size: clamp(1.9rem, 4vw, 3.2rem);
`;

const Description = styled.p`
  max-width: 880px;
  margin: 0.85rem 0 0;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.8;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.2rem;
`;

const Button = styled.button<{ $variant?: 'primary' }>`
  border: 0;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  cursor: pointer;
  color: ${props => props.$variant === 'primary' ? '#ffffff' : '#243447'};
  background: ${props => props.$variant === 'primary'
    ? 'linear-gradient(135deg, #b26b00 0%, #f59e0b 100%)'
    : 'rgba(255, 255, 255, 0.92)'};
  box-shadow: 0 10px 24px rgba(37, 60, 80, 0.12);
  border: 1px solid rgba(222, 226, 230, 0.9);
  font-weight: 700;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const Grid = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  padding: 1.2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(222, 226, 230, 0.95);
  box-shadow: 0 14px 34px rgba(37, 60, 80, 0.08);
`;

const CardTitle = styled.h2`
  margin: 0 0 0.85rem;
  font-size: 1.05rem;
  color: #243447;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 0.35rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.86rem;

  input,
  select {
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 12px;
    padding: 0.65rem 0.75rem;
    background: #ffffff;
    color: ${props => props.theme.colors.text};
  }
`;

const CategoryList = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const CategoryItem = styled.div`
  padding: 0.75rem;
  border-radius: 14px;
  background: #f8fafc;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;

  strong {
    color: #243447;
    display: block;
  }
`;

const ResultBox = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0.85rem 0 0;
  padding: 0.85rem;
  border-radius: 14px;
  background: #172033;
  color: #ffe9bd;
  font-size: 0.82rem;
  line-height: 1.55;
`;

const EmptyText = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.7;
`;

const TemplateDebugPage = () => {
  const [library, setLibrary] = useState<JiuYinTemplateLibrarySummary | null>(null);
  const [report, setReport] = useState<JiuYinTemplateMatchReport | null>(null);
  const [category, setCategory] = useState<JiuYinTemplateCategory | 'all'>('all');
  const [threshold, setThreshold] = useState('0.88');
  const [maxResults, setMaxResults] = useState('20');
  const [scanStep, setScanStep] = useState('4');
  const [sourceImagePath, setSourceImagePath] = useState('');
  const [captureWindow, setCaptureWindow] = useState(true);
  const [saveFailedCapture, setSaveFailedCapture] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTemplateCount = useMemo(() => {
    if (!library) return 0;
    if (category === 'all') return library.templates.length;
    return library.templates.filter(template => template.category === category).length;
  }, [category, library]);

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        setLibrary(await window.jiuyin.listTemplates());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '模板库加载失败');
      }
    };

    loadLibrary();
  }, []);

  const refreshLibrary = async () => {
    setIsLoading(true);
    try {
      setLibrary(await window.jiuyin.listTemplates());
      toast.success('模板库已刷新');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模板库刷新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const openTemplateRoot = async () => {
    try {
      const rootPath = await window.jiuyin.openTemplateRoot();
      toast.success(`已打开模板目录：${rootPath}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模板目录打开失败');
    }
  };

  const runMatch = async () => {
    setIsLoading(true);
    try {
      const nextReport = await window.jiuyin.matchTemplates({
        category,
        threshold: Number(threshold),
        maxResults: Number(maxResults),
        step: Number(scanStep),
        sourceImagePath: sourceImagePath.trim() || undefined,
        captureWindow,
        saveFailedCapture,
      });
      setReport(nextReport);
      toast.success(nextReport.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模板匹配失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Eyebrow>Phase 2 / Template Debug</Eyebrow>
        <Title>九阴模板识别调试</Title>
        <Description>
          阶段 2 先建立模板调试闭环：扫描分类模板目录，使用当前九阴窗口截图或指定图片进行匹配，
          输出置信度和坐标。当前不会执行点击或业务流程，只用于采集、复盘和校准模板。
        </Description>
        <Toolbar>
          <Button disabled={isLoading} onClick={refreshLibrary}>刷新模板库</Button>
          <Button disabled={isLoading} onClick={openTemplateRoot}>打开模板目录</Button>
        </Toolbar>
      </Header>

      <Grid>
        <Card>
          <CardTitle>模板分类</CardTitle>
          {library ? (
            <CategoryList>
              {library.categories.map(item => (
                <CategoryItem key={item.category}>
                  <strong>{item.label}：{item.count} 个</strong>
                  <span>{item.directory}</span>
                </CategoryItem>
              ))}
            </CategoryList>
          ) : (
            <EmptyText>模板库尚未加载。</EmptyText>
          )}
        </Card>

        <Card>
          <CardTitle>匹配参数</CardTitle>
          <FormGrid>
            <Field>
              分类
              <select value={category} onChange={event => setCategory(event.target.value as JiuYinTemplateCategory | 'all')}>
                <option value="all">全部分类</option>
                {JIUYIN_TEMPLATE_CATEGORIES.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field>
              阈值
              <input value={threshold} onChange={event => setThreshold(event.target.value)} />
            </Field>
            <Field>
              最大结果数
              <input value={maxResults} onChange={event => setMaxResults(event.target.value)} />
            </Field>
            <Field>
              扫描步长
              <input value={scanStep} onChange={event => setScanStep(event.target.value)} />
            </Field>
            <Field>
              截取九阴窗口
              <select value={captureWindow ? 'yes' : 'no'} onChange={event => setCaptureWindow(event.target.value === 'yes')}>
                <option value="yes">是，使用当前九阴窗口截图</option>
                <option value="no">否，使用下面的图片路径</option>
              </select>
            </Field>
            <Field>
              保存失败样本
              <select
                value={saveFailedCapture ? 'yes' : 'no'}
                onChange={event => setSaveFailedCapture(event.target.value === 'yes')}
              >
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </Field>
          </FormGrid>
          <Field>
            指定图片路径
            <input
              value={sourceImagePath}
              onChange={event => setSourceImagePath(event.target.value)}
              placeholder="关闭窗口截图后，可填写本地截图文件路径"
            />
          </Field>
          <Toolbar>
            <Button $variant="primary" disabled={isLoading || selectedTemplateCount === 0} onClick={runMatch}>
              运行模板匹配
            </Button>
          </Toolbar>
          <EmptyText>当前选择范围包含 {selectedTemplateCount} 个模板。扫描步长越小越精确，但耗时越长。</EmptyText>
          {report && (
            <ResultBox>{JSON.stringify(report, null, 2)}</ResultBox>
          )}
        </Card>
      </Grid>
    </PageWrapper>
  );
};

export default TemplateDebugPage;
