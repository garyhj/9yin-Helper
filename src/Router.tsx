// 喵~ 使用 React.lazy 实现路由懒加载，优化初始加载速度
import {lazy, Suspense} from "react";
import {createHashRouter} from "react-router-dom";
import MainLayout from "./components/MainLayout.tsx";
import ErrorPage from "./components/pages/ErrorPage.tsx";
import {JiuYinHomePage} from "./components/pages/JiuYinHomePage.tsx";
import { RoutePath } from "./constants/routes";

const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));


const LoadingSpinner = () => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
    </div>
)



export const router = createHashRouter([
    {
        path: RoutePath.HOME,
        element: <MainLayout/>, // 使用我们的主布局
        errorElement: <ErrorPage/>,
        children: [
            // 当用户访问根路径时，显示主页
            {
                index:true,
                element: (
                    <Suspense fallback={<LoadingSpinner/>}>
                        <JiuYinHomePage/>
                    </Suspense>
                )
            },
            {
                path: RoutePath.SETTINGS.slice(1),
                element: (
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SettingsPage/>
                    </Suspense>
                )
            },
        ]
    },
]);
