import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import type {
  JiuYinCaptureResult,
  JiuYinCheckStatus,
  JiuYinEnvironmentReport,
  JiuYinInputProbeAction,
  JiuYinInputProbeResult,
  JiuYinRuntimeState,
  JiuYinWindowInfo,
} from '../../shared/jiuyin-stage1.ts';
import { toast } from '../components/toast/toast-core.ts';

const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background:
    radial-gradient(circle at 82% 12%, rgba(16, 185, 129, 0.16), transparent 24rem),
    linear-gradient(145deg, #f8fbff 0%, #eef6f4 52%, #f7f1e8 100%);
  color: ${props => props.theme.colors.text};
`;

const Header = styled.section`
  max-width: 1180px;
  margin: 0 auto 1.25rem;
  padding: 1.75rem;
  border-radius: 24px;
  border: 1px solid rgba(102, 204, 255, 0.35);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 22px 60px rgba(37, 60, 80, 0.12);
`;

const Eyebrow = styled.div`
  color: #0f8f7f;
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
  max-width: 860px;
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

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  border: 0;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  cursor: pointer;
  color: ${props => props.$variant === 'primary' ? '#ffffff' : '#243447'};
  background: ${props => props.$variant === 'primary'
    ? 'linear-gradient(135deg, #0ea5a3 0%, #10b981 100%)'
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
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
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

const CheckList = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const statusColor: Record<JiuYinCheckStatus, string> = {
  pass: '#10b981',
  warn: '#f59e0b',
  fail: '#ef4444',
};

const CheckItem = styled.div<{ $status: JiuYinCheckStatus }>`
  display: grid;
  grid-template-columns: 0.65rem minmax(8rem, 0.35fr) minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
  padding: 0.75rem;
  border-radius: 14px;
  background: #f8fafc;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;

  &::before {
    content: '';
    width: 0.65rem;
    height: 0.65rem;
    margin-top: 0.38rem;
    border-radius: 999px;
    background: ${props => statusColor[props.$status]};
  }

  strong {
    color: #243447;
  }
`;

const WindowList = styled.div`
  display: grid;
  gap: 0.65rem;
  max-height: 320px;
  overflow: auto;
`;

const WindowItem = styled.div<{ $matched: boolean }>`
  padding: 0.75rem;
  border-radius: 14px;
  background: ${props => props.$matched ? 'rgba(16, 185, 129, 0.1)' : '#f8fafc'};
  border: 1px solid ${props => props.$matched ? 'rgba(16, 185, 129, 0.28)' : 'rgba(222, 226, 230, 0.9)'};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;

  strong {
    color: #243447;
    display: block;
  }
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

const ResultBox = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0.85rem 0 0;
  padding: 0.85rem;
  border-radius: 14px;
  background: #172033;
  color: #d7f7ef;
  font-size: 0.82rem;
  line-height: 1.55;
`;

const EmptyText = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.7;
`;

const formatBounds = (window: JiuYinWindowInfo | null) => {
  if (!window) return '未找到';
  const { left, top, width, height } = window.bounds;
  return `${left}, ${top}, ${width} x ${height}`;
};

const EnvironmentCheckPage = () => {
  const [report, setReport] = useState<JiuYinEnvironmentReport | null>(null);
  const [windows, setWindows] = useState<JiuYinWindowInfo[]>([]);
  const [runtime, setRuntime] = useState<JiuYinRuntimeState | null>(null);
  const [captureResult, setCaptureResult] = useState<JiuYinCaptureResult | null>(null);
  const [probeResult, setProbeResult] = useState<JiuYinInputProbeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [probeAction, setProbeAction] = useState<JiuYinInputProbeAction>('click');
  const [relativeX, setRelativeX] = useState('0.5');
  const [relativeY, setRelativeY] = useState('0.5');
  const [dragToX, setDragToX] = useState('0.55');
  const [dragToY, setDragToY] = useState('0.5');
  const [key, setKey] = useState('F10');

  const primaryWindow = report?.primaryWindow ?? null;

  const probePayload = useMemo(() => {
    const point = { x: Number(relativeX), y: Number(relativeY) };
    if (probeAction === 'click') return { action: probeAction, relativePoint: point };
    if (probeAction === 'drag') {
      return {
        action: probeAction,
        relativeFrom: point,
        relativeTo: { x: Number(dragToX), y: Number(dragToY) },
      };
    }
    if (probeAction === 'combo') {
      return { action: probeAction, keys: key.split('+').map(part => part.trim()).filter(Boolean), key };
    }
    return { action: probeAction, key };
  }, [dragToX, dragToY, key, probeAction, relativeX, relativeY]);

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const nextReport = await window.jiuyin.checkEnvironment();
      setReport(nextReport);
      setWindows(nextReport.windows);
      setRuntime(nextReport.runtime);
      toast.success('环境检查完成');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '环境检查失败');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWindows = async () => {
    setIsLoading(true);
    try {
      setWindows(await window.jiuyin.listWindows());
      toast.success('窗口列表已刷新');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '窗口列表刷新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const captureWindow = async () => {
    setIsLoading(true);
    try {
      const result = await window.jiuyin.captureRegion({ useWindowRegion: true });
      setCaptureResult(result);
      toast.success('截图已保存');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '截图失败');
    } finally {
      setIsLoading(false);
    }
  };

  const runProbe = async () => {
    setIsLoading(true);
    try {
      const result = await window.jiuyin.runInputProbe(probePayload);
      setProbeResult(result);
      setRuntime(await window.jiuyin.getRuntimeState());
      toast.success('输入探针已发送');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '输入探针失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runCheck();

    const cleanup = window.ipc?.on('jiuyin-runtime-updated', (nextState: JiuYinRuntimeState) => {
      setRuntime(nextState);
    });
    return () => cleanup?.();
  }, []);

  return (
    <PageWrapper>
      <Header>
        <Eyebrow>Phase 1 / Environment Probe</Eyebrow>
        <Title>九阴基础环境与输入验证</Title>
        <Description>
          这里用于确认九阴窗口是否可见、坐标/DPI 是否可信、nut-js 输入是否会被前台窗口接受。
          这些按钮只会在你主动点击时执行探针，不会启动团练、授业或其他业务自动化。
        </Description>
        <Toolbar>
          <Button $variant="primary" disabled={isLoading} onClick={runCheck}>重新检查环境</Button>
          <Button disabled={isLoading} onClick={refreshWindows}>刷新窗口列表</Button>
          <Button disabled={isLoading || !primaryWindow} onClick={captureWindow}>保存九阴窗口截图</Button>
        </Toolbar>
      </Header>

      <Grid>
        <Card>
          <CardTitle>检查结果</CardTitle>
          {report ? (
            <CheckList>
              {report.checks.map(item => (
                <CheckItem key={item.id} $status={item.status}>
                  <strong>{item.label}</strong>
                  <span>{item.message}</span>
                </CheckItem>
              ))}
            </CheckList>
          ) : (
            <EmptyText>尚未完成检查。</EmptyText>
          )}
        </Card>

        <Card>
          <CardTitle>当前状态</CardTitle>
          <EmptyText>主窗口：{primaryWindow?.title ?? '未找到'}</EmptyText>
          <EmptyText>坐标：{formatBounds(primaryWindow)}</EmptyText>
          <EmptyText>屏幕：{report ? `${report.display.width} x ${report.display.height} / 缩放 ${report.display.scaleFactor}` : '未检查'}</EmptyText>
          <EmptyText>运行：{runtime?.message ?? '待机'}</EmptyText>
          {captureResult && (
            <ResultBox>{JSON.stringify(captureResult, null, 2)}</ResultBox>
          )}
        </Card>

        <Card>
          <CardTitle>窗口候选</CardTitle>
          <WindowList>
            {windows.length > 0 ? windows.map((item, index) => (
              <WindowItem key={`${item.title}-${index}`} $matched={item.isLikelyJiuYin}>
                <strong>{item.title}</strong>
                <span>{item.matchReason}</span>
                <br />
                <span>{formatBounds(item)} / {item.isVisible ? '可见' : '不可见'}</span>
              </WindowItem>
            )) : (
              <EmptyText>没有可展示的窗口候选。</EmptyText>
            )}
          </WindowList>
        </Card>

        <Card>
          <CardTitle>输入探针</CardTitle>
          <FormGrid>
            <Field>
              探针类型
              <select value={probeAction} onChange={event => setProbeAction(event.target.value as JiuYinInputProbeAction)}>
                <option value="click">相对坐标点击</option>
                <option value="key">普通按键</option>
                <option value="combo">组合键</option>
                <option value="drag">鼠标拖拽</option>
              </select>
            </Field>
            <Field>
              按键 / 组合键
              <input value={key} onChange={event => setKey(event.target.value)} placeholder="F10 或 Ctrl+J" />
            </Field>
            <Field>
              相对 X
              <input value={relativeX} onChange={event => setRelativeX(event.target.value)} />
            </Field>
            <Field>
              相对 Y
              <input value={relativeY} onChange={event => setRelativeY(event.target.value)} />
            </Field>
            <Field>
              拖拽目标 X
              <input value={dragToX} onChange={event => setDragToX(event.target.value)} />
            </Field>
            <Field>
              拖拽目标 Y
              <input value={dragToY} onChange={event => setDragToY(event.target.value)} />
            </Field>
          </FormGrid>
          <Toolbar>
            <Button $variant="primary" disabled={isLoading || !primaryWindow} onClick={runProbe}>
              发送输入探针
            </Button>
          </Toolbar>
          <EmptyText>
            坐标采用窗口相对比例，0.5 / 0.5 表示窗口中心。发送后请在游戏内人工确认是否真实响应。
          </EmptyText>
          {probeResult && (
            <ResultBox>{JSON.stringify(probeResult, null, 2)}</ResultBox>
          )}
        </Card>
      </Grid>
    </PageWrapper>
  );
};

export default EnvironmentCheckPage;
