import styled from "styled-components";

const PageWrapper = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 18%, rgba(102, 204, 255, 0.22), transparent 28rem),
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
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 70px rgba(37, 60, 80, 0.12);
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primaryHover};
  font-size: 0.85rem;
  font-weight: 700;
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
  max-width: 760px;
  margin: 1rem 0 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.05rem;
  line-height: 1.8;
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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 1.25rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.13);
  color: #a15c00;
  font-weight: 700;
  font-size: 0.86rem;
`;

export const JiuYinHomePage = () => {
  return (
    <PageWrapper>
      <Hero>
        <Eyebrow>JiuYin Helper / Phase 0</Eyebrow>
        <Title>九阴真经助手</Title>
        <Subtitle>
          当前项目已切换为九阴专用方向。阶段 0 先完成项目壳和目录规范调整，
          后续会优先验证九阴窗口识别、截图区域和 nut-js 输入是否真实生效。
        </Subtitle>
        <StatusBadge>当前状态：九阴模块接入中，自动化功能尚未启用</StatusBadge>
      </Hero>

      <Grid>
        <Card>
          <CardTitle>1. 窗口识别</CardTitle>
          <CardText>
            下一阶段会实现九阴客户端窗口查找、窗口坐标记录、DPI/分辨率检查和截图调试入口。
          </CardText>
        </Card>
        <Card>
          <CardTitle>2. 输入验证</CardTitle>
          <CardText>
            默认先使用 nut-js 做前台点击、按键、组合键和拖拽探针；如果游戏不接受输入，再评估硬件后端。
          </CardText>
        </Card>
        <Card>
          <CardTitle>3. 模板调试</CardTitle>
          <CardText>
            九阴图色识别会按通用、团练、授业、采集、生活、日常等分类管理模板和失败截图。
          </CardText>
        </Card>
      </Grid>
    </PageWrapper>
  );
};

