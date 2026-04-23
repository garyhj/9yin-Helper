import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { RoutePath } from '../constants/routes';

const PageWrapper = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 18%, rgba(102, 204, 255, 0.22), transparent 28rem),
    radial-gradient(circle at 88% 10%, rgba(16, 185, 129, 0.16), transparent 22rem),
    linear-gradient(135deg, #f8fbff 0%, #edf4f8 46%, #f7f1e8 100%);
  color: ${props => props.theme.colors.text};
  padding: 2rem;
`;

const Hero = styled.section`
  max-width: 1120px;
  margin: 0 auto 1.5rem;
  padding: 2rem;
  border: 1px solid rgba(102, 204, 255, 0.35);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 24px 70px rgba(37, 60, 80, 0.12);
`;

const Eyebrow = styled.div`
  color: #0f8f7f;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.05;
  color: #1f2a37;
`;

const Subtitle = styled.p`
  max-width: 780px;
  margin: 1rem 0 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.05rem;
  line-height: 1.8;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.35rem;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.75rem 1.05rem;
  color: #ffffff;
  background: linear-gradient(135deg, #0ea5a3 0%, #10b981 100%);
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.2);
  text-decoration: none;
  font-weight: 800;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.58rem 0.85rem;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.13);
  color: #a15c00;
  font-weight: 800;
  font-size: 0.9rem;
`;

const Grid = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const Card = styled.article`
  padding: 1.25rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(222, 226, 230, 0.95);
  box-shadow: 0 14px 34px rgba(37, 60, 80, 0.08);
`;

const CardTitle = styled.h2`
  margin: 0 0 0.55rem;
  font-size: 1.05rem;
  color: #243447;
`;

const CardText = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.92rem;
  line-height: 1.7;
`;

export const JiuYinHomePage = () => {
  return (
    <PageWrapper>
      <Hero>
        <Eyebrow>JiuYin Helper / Phase 2</Eyebrow>
        <Title>九阴真经助手</Title>
        <Subtitle>
          阶段 2 已接入模板识别调试能力：可以扫描九阴模板目录，使用窗口截图或指定图片运行匹配，
          输出置信度、坐标和失败样本，继续保持业务自动化禁用。
        </Subtitle>
        <ActionRow>
          <PrimaryLink to={RoutePath.ENVIRONMENT}>打开环境检查</PrimaryLink>
          <PrimaryLink to={RoutePath.TEMPLATE_DEBUG}>打开模板调试</PrimaryLink>
          <StatusBadge>业务自动化仍保持禁用，等待真实模板素材验收</StatusBadge>
        </ActionRow>
      </Hero>

      <Grid>
        <Card>
          <CardTitle>1. 窗口与截图</CardTitle>
          <CardText>
            环境检查页会列出疑似九阴窗口，展示坐标、尺寸、DPI 和分辨率，并支持对九阴窗口区域保存截图用于调试。
          </CardText>
        </Card>
        <Card>
          <CardTitle>2. 模板调试</CardTitle>
          <CardText>
            模板调试页会按通用、任务、团练、授业、采集、生活、日常、隐士分类扫描模板，并输出匹配坐标。
          </CardText>
        </Card>
        <Card>
          <CardTitle>3. 安全热键</CardTitle>
          <CardText>
            F10 用于切换阶段 1 输入验证模式，F12 用于请求当前动作后停止。热键冲突会被拦截并提示。
          </CardText>
        </Card>
      </Grid>
    </PageWrapper>
  );
};
