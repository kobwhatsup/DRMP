import React, { useRef, useState, useEffect } from 'react';
import { Button, Dropdown, Space, Tooltip, message } from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  ColumnWidthOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTabStore } from '@/store/tabStore';
import { useNavigate, useLocation } from 'react-router-dom';
import TabItem from './TabItem';
import styles from './style.module.scss';

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const {
    tabs,
    activeTabId,
    recentlyClosed,
    addTab,
    removeTab,
    removeOtherTabs,
    removeTabsToRight,
    removeTabsToLeft,
    removeAllTabs,
    setActiveTab,
    moveTab,
    restoreClosedTab,
  } = useTabStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Check scroll status
  useEffect(() => {
    const checkScroll = () => {
      if (tabBarRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabBarRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    const tabBar = tabBarRef.current;
    tabBar?.addEventListener('scroll', checkScroll);

    return () => {
      window.removeEventListener('resize', checkScroll);
      tabBar?.removeEventListener('scroll', checkScroll);
    };
  }, [tabs]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      moveTab(oldIndex, newIndex);
    }
  };

  const handleTabClick = (tabId: string, path: string) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const handleAddTab = () => {
    const id = addTab({
      title: '工作台',
      path: '/dashboard',
      closable: true,
    });
    navigate('/dashboard');
  };

  const scrollLeft = () => {
    if (tabBarRef.current) {
      tabBarRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tabBarRef.current) {
      tabBarRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Context menu items for a specific tab
  const getTabContextMenuItems = (tabId: string) => [
    {
      key: 'refresh',
      icon: <ReloadOutlined />,
      label: '刷新',
      onClick: () => window.location.reload(),
    },
    { type: 'divider' as const },
    {
      key: 'close',
      icon: <CloseOutlined />,
      label: '关闭',
      onClick: () => removeTab(tabId),
      disabled: tabs.find(t => t.id === tabId)?.isFixed,
    },
    {
      key: 'close-others',
      icon: <CloseCircleOutlined />,
      label: '关闭其他',
      onClick: () => removeOtherTabs(tabId),
    },
    {
      key: 'close-right',
      icon: <ColumnWidthOutlined />,
      label: '关闭右侧',
      onClick: () => removeTabsToRight(tabId),
    },
    {
      key: 'close-left',
      icon: <ColumnWidthOutlined style={{ transform: 'rotate(180deg)' }} />,
      label: '关闭左侧',
      onClick: () => removeTabsToLeft(tabId),
    },
    {
      key: 'close-all',
      icon: <CloseCircleOutlined />,
      label: '关闭全部',
      onClick: () => removeAllTabs(),
    },
  ];

  // More menu items
  const moreMenuItems = [
    {
      key: 'all-tabs',
      icon: <AppstoreOutlined />,
      label: '所有标签',
      children: tabs.map(tab => ({
        key: tab.id,
        label: (
          <Space>
            {tab.isFixed && '📌'}
            <span>{tab.title}</span>
          </Space>
        ),
        onClick: () => {
          setActiveTab(tab.id);
          navigate(tab.path);
        },
      })),
    },
    { type: 'divider' as const },
    {
      key: 'recently-closed',
      icon: <ReloadOutlined />,
      label: '最近关闭',
      disabled: recentlyClosed.length === 0,
      children: recentlyClosed.map((tab, index) => ({
        key: `recent-${index}`,
        label: tab.title,
        onClick: () => restoreClosedTab(),
      })),
    },
    { type: 'divider' as const },
    {
      key: 'close-all-tabs',
      icon: <CloseCircleOutlined />,
      label: '关闭所有标签',
      onClick: () => removeAllTabs(),
    },
  ];

  return (
    <div className={styles.tabBarContainer}>
      {showScrollButtons && (
        <Button
          type="text"
          size="small"
          icon={<LeftOutlined />}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={styles.scrollButton}
        />
      )}

      <div className={styles.tabBar} ref={tabBarRef}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabs.map(t => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                onClick={() => handleTabClick(tab.id, tab.path)}
                onClose={() => removeTab(tab.id)}
                contextMenuItems={getTabContextMenuItems(tab.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {showScrollButtons && (
        <Button
          type="text"
          size="small"
          icon={<RightOutlined />}
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={styles.scrollButton}
        />
      )}

      <Tooltip title="新建标签页 (Ctrl+T)">
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleAddTab}
          className={styles.addButton}
        />
      </Tooltip>

      <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          className={styles.moreButton}
        />
      </Dropdown>
    </div>
  );
};

export default TabBar;