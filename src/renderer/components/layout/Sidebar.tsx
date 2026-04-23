import BoltIcon from '@mui/icons-material/Bolt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import SettingsIcon from '@mui/icons-material/Settings';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import type { SvgIconComponent } from '@mui/icons-material';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { RoutePath } from '../../constants/routes';

interface NavItem {
  path: RoutePath;
  label: string;
  icon: SvgIconComponent;
  show: boolean;
}

const navItems: NavItem[] = [
  { path: RoutePath.HOME, label: '主界面', icon: HomeIcon, show: true },
  { path: RoutePath.ENVIRONMENT, label: '环境检查', icon: TravelExploreIcon, show: true },
  { path: RoutePath.TEMPLATE_DEBUG, label: '模板调试', icon: ImageSearchIcon, show: true },
  { path: RoutePath.SETTINGS, label: '设置', icon: SettingsIcon, show: true },
];

const LinkText = styled.span<{ $isCollapsed: boolean }>`
  opacity: ${props => props.$isCollapsed ? 0 : 1};
  width: ${props => props.$isCollapsed ? '0' : 'auto'};
  transition: opacity 0.2s ease-in-out, width 0.2s ease-in-out;
  white-space: nowrap;
  overflow: hidden;
`;

const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  background-color: ${props => props.theme.colors.sidebarBg};
  color: ${props => props.theme.colors.text};
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.medium};
  border-right: 1.5px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.$isCollapsed ? props.theme.sidebar.collapsedWidth : props.theme.sidebar.width}px;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;

  .MuiSvgIcon-root {
    color: ${props => props.theme.colors.primaryHover};
    font-size: 2rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StyledNavLink = styled(NavLink)<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border-radius: ${props => props.theme.borderRadius};
  color: ${props => props.theme.colors.textSecondary};
  overflow: hidden;

  .MuiSvgIcon-root {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  &:hover {
    background-color: ${props => props.theme.colors.elementHover};
    color: ${props => props.theme.colors.text};
  }

  &.active {
    background-color: ${props => props.theme.colors.navActiveBg};
    color: ${props => props.theme.colors.navActiveText};

    .MuiSvgIcon-root {
      color: ${props => props.theme.colors.navActiveText};
    }
  }
`;

const ToggleButton = styled.button`
  margin-top: auto;
  background-color: ${props => props.theme.colors.elementHover};
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.primary};
  }
`;

const NavItemWrapper = styled.div<{ $isVisible: boolean }>`
  display: grid;
  grid-template-rows: ${props => props.$isVisible ? '1fr' : '0fr'};
  transition: grid-template-rows 0.3s ease-in-out;

  > div {
    overflow: hidden;
  }
`;

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <Logo>
        <BoltIcon />
        <LinkText $isCollapsed={isCollapsed}>九阴助手</LinkText>
      </Logo>
      <Nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavItemWrapper key={item.path} $isVisible={item.show}>
              <div>
                <StyledNavLink to={item.path} $isCollapsed={isCollapsed}>
                  <Icon />
                  <LinkText $isCollapsed={isCollapsed}>{item.label}</LinkText>
                </StyledNavLink>
              </div>
            </NavItemWrapper>
          );
        })}
      </Nav>
      <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </ToggleButton>
    </SidebarContainer>
  );
};

export default Sidebar;
