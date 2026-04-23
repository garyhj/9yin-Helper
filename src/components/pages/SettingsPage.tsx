import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ThemeType } from '../../styles/theme.ts';
import { logStore, LogAutoCleanThreshold } from '../../stores/logStore.ts';
import { toast } from '../toast/toast-core.ts';

const PageWrapper = styled.div<{ theme: ThemeType }>`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.large};
  height: 100vh;
  overflow-y: auto;
  transition: background-color 0.3s, color 0.3s;
`;

const PageTitle = styled.h1`
  margin: 0 0 ${props => props.theme.spacing.large};
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  color: ${props => props.theme.colors.text};
`;

const SettingsHeader = styled.h2`
  margin: ${props => props.theme.spacing.large} 0 ${props => props.theme.spacing.small};
  font-size: ${props => props.theme.fontSizes.large};
`;

const SettingsCard = styled.div`
  background-color: ${props => props.theme.colors.elementBg};
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.medium};
  transition: background-color 0.3s, border-color 0.3s;
`;

const NoticeCard = styled(SettingsCard)`
  background:
    linear-gradient(135deg, rgba(102, 204, 255, 0.13), rgba(245, 158, 11, 0.1)),
    ${props => props.theme.colors.elementBg};

  ul {
    margin: 0;
    padding-left: 1.2rem;
    line-height: 1.8;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.large};

  &:not(:last-child) {
    margin-bottom: ${props => props.theme.spacing.medium};
    padding-bottom: ${props => props.theme.spacing.medium};
    border-bottom: 1px solid ${props => props.theme.colors.divider};
  }
`;

const SettingText = styled.div`
  h3 {
    margin: 0;
    font-size: ${props => props.theme.fontSizes.medium};
    font-weight: 700;
    color: ${props => props.theme.colors.text};
  }

  p {
    margin: 0.35rem 0 0;
    font-size: ${props => props.theme.fontSizes.small};
    color: ${props => props.theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const HotkeyInput = styled.div<{ $isRecording: boolean }>`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.$isRecording ? props.theme.colors.primary : props.theme.colors.text};
  border: 1px solid ${props => props.$isRecording ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  padding: 0.55rem 1rem;
  min-width: 130px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SelectWrapper = styled.select<{ theme: ThemeType }>`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  padding: 0.5rem 1rem;
  min-width: 130px;
  font-size: ${props => props.theme.fontSizes.small};
`;

const VersionText = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.small};
`;

const keyMap: Record<string, string> = {
  ' ': 'Space',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Escape: 'Esc',
};

const parseKeyboardEventToAccelerator = (event: KeyboardEvent): string | null => {
  const parts: string[] = [];

  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  if (event.metaKey) parts.push('Meta');

  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    return null;
  }

  const mappedKey = keyMap[event.key] ?? (event.key.length === 1 ? event.key.toUpperCase() : event.key);
  parts.push(mappedKey);
  return parts.join('+');
};

const SettingsPage = () => {
  const [logAutoCleanThreshold, setLogAutoCleanThreshold] = useState<LogAutoCleanThreshold>(
    logStore.getThreshold()
  );
  const [toggleHotkey, setToggleHotkey] = useState('F1');
  const [stopAfterTaskHotkey, setStopAfterTaskHotkey] = useState('F2');
  const [isRecordingToggleHotkey, setIsRecordingToggleHotkey] = useState(false);
  const [isRecordingStopAfterTaskHotkey, setIsRecordingStopAfterTaskHotkey] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      await logStore.refreshThreshold();
      setLogAutoCleanThreshold(logStore.getThreshold());

      const [toggle, stopAfterTask, version] = await Promise.all([
        window.util.getToggleHotkey(),
        window.util.getStopAfterGameHotkey(),
        window.util.getAppVersion(),
      ]);

      setToggleHotkey(toggle);
      setStopAfterTaskHotkey(stopAfterTask);
      setCurrentVersion(version);
    };

    loadSettings();
  }, []);

  const updateToggleHotkey = useCallback(async (accelerator: string) => {
    const success = await window.util.setToggleHotkey(accelerator);
    if (success) {
      setToggleHotkey(accelerator);
      toast.success(accelerator ? '任务开关快捷键已更新' : '任务开关快捷键已取消');
    } else {
      toast.error('快捷键注册失败，请换一个组合键');
    }
  }, []);

  const updateStopAfterTaskHotkey = useCallback(async (accelerator: string) => {
    const success = await window.util.setStopAfterGameHotkey(accelerator);
    if (success) {
      setStopAfterTaskHotkey(accelerator);
      toast.success(accelerator ? '任务结束后停止快捷键已更新' : '任务结束后停止快捷键已取消');
    } else {
      toast.error('快捷键注册失败，请换一个组合键');
    }
  }, []);

  const handleToggleHotkeyKeyDown = useCallback(async (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      await updateToggleHotkey('');
      setIsRecordingToggleHotkey(false);
      return;
    }

    const accelerator = parseKeyboardEventToAccelerator(event);
    if (!accelerator) return;

    await updateToggleHotkey(accelerator);
    setIsRecordingToggleHotkey(false);
  }, [updateToggleHotkey]);

  const handleStopAfterTaskHotkeyKeyDown = useCallback(async (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      await updateStopAfterTaskHotkey('');
      setIsRecordingStopAfterTaskHotkey(false);
      return;
    }

    const accelerator = parseKeyboardEventToAccelerator(event);
    if (!accelerator) return;

    await updateStopAfterTaskHotkey(accelerator);
    setIsRecordingStopAfterTaskHotkey(false);
  }, [updateStopAfterTaskHotkey]);

  useEffect(() => {
    if (!isRecordingToggleHotkey) return;

    window.addEventListener('keydown', handleToggleHotkeyKeyDown, true);
    return () => window.removeEventListener('keydown', handleToggleHotkeyKeyDown, true);
  }, [handleToggleHotkeyKeyDown, isRecordingToggleHotkey]);

  useEffect(() => {
    if (!isRecordingStopAfterTaskHotkey) return;

    window.addEventListener('keydown', handleStopAfterTaskHotkeyKeyDown, true);
    return () => window.removeEventListener('keydown', handleStopAfterTaskHotkeyKeyDown, true);
  }, [handleStopAfterTaskHotkeyKeyDown, isRecordingStopAfterTaskHotkey]);

  const handleLogThresholdChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const threshold = Number(event.target.value) as LogAutoCleanThreshold;
    setLogAutoCleanThreshold(threshold);
    await logStore.setThreshold(threshold);
    toast.success('日志自动清理阈值已更新');
  };

  return (
    <PageWrapper>
      <PageTitle>九阴真经助手设置</PageTitle>

      <NoticeCard>
        <ul>
          <li>项目已调整为九阴专用方向，不再保留 TFT、阵容、棋盘和对局设置入口。</li>
          <li>当前处于阶段 0：只完成项目壳、目录和基础配置，自动化任务尚未启用。</li>
          <li>后续阶段会先验证窗口识别、截图区域和 nut-js 输入，验证通过后再开发团练、授业等功能。</li>
          <li>不提供反检测、窗口绑定、最小化后台执行、内存、封包、驱动或绕过安全软件相关能力。</li>
        </ul>
      </NoticeCard>

      <SettingsHeader>快捷键</SettingsHeader>
      <SettingsCard>
        <SettingItem>
          <SettingText>
            <h3>任务开关</h3>
            <p>用于后续九阴任务的全局启动/停止。录入时按 Esc 可取消绑定。</p>
          </SettingText>
          <HotkeyInput
            $isRecording={isRecordingToggleHotkey}
            onClick={() => {
              setIsRecordingStopAfterTaskHotkey(false);
              setIsRecordingToggleHotkey(true);
            }}
            tabIndex={0}
          >
            {isRecordingToggleHotkey ? '请按下快捷键' : (toggleHotkey || '未绑定')}
          </HotkeyInput>
        </SettingItem>

        <SettingItem>
          <SettingText>
            <h3>当前任务结束后停止</h3>
            <p>用于后续让九阴任务在安全检查点收尾停止。录入时按 Esc 可取消绑定。</p>
          </SettingText>
          <HotkeyInput
            $isRecording={isRecordingStopAfterTaskHotkey}
            onClick={() => {
              setIsRecordingToggleHotkey(false);
              setIsRecordingStopAfterTaskHotkey(true);
            }}
            tabIndex={0}
          >
            {isRecordingStopAfterTaskHotkey ? '请按下快捷键' : (stopAfterTaskHotkey || '未绑定')}
          </HotkeyInput>
        </SettingItem>
      </SettingsCard>

      <SettingsHeader>日志</SettingsHeader>
      <SettingsCard>
        <SettingItem>
          <SettingText>
            <h3>自动清理阈值</h3>
            <p>当日志数量超过阈值时，自动删除一半旧日志，避免长时间运行占用过多内存。</p>
          </SettingText>
          <SelectWrapper value={logAutoCleanThreshold} onChange={handleLogThresholdChange}>
            <option value={0}>从不</option>
            <option value={100}>100 条</option>
            <option value={200}>200 条</option>
            <option value={500}>500 条</option>
            <option value={1000}>1000 条</option>
          </SelectWrapper>
        </SettingItem>
      </SettingsCard>

      <SettingsHeader>关于</SettingsHeader>
      <SettingsCard>
        <SettingItem>
          <SettingText>
            <h3>项目</h3>
            <p>九阴真经助手。阶段 0 只保留九阴专用入口和通用配置。</p>
          </SettingText>
          <VersionText>v{currentVersion || '加载中'}</VersionText>
        </SettingItem>
      </SettingsCard>
    </PageWrapper>
  );
};

export default SettingsPage;
