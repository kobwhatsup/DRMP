import React, { useState, useRef, useEffect } from 'react';
import { Dropdown, Input, Tooltip } from 'antd';
import {
  CloseOutlined,
  PushpinOutlined,
  PushpinFilled,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tab, useTabStore } from '@/store/tabStore';
import classNames from 'classnames';
import styles from './style.module.scss';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
  contextMenuItems: any[];
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onClick,
  onClose,
  contextMenuItems,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(tab.title);
  const inputRef = useRef<any>(null);
  const { updateTab, toggleFixTab } = useTabStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!tab.isFixed) {
      setIsEditing(true);
      setEditTitle(tab.title);
    }
  };

  const handleEditComplete = () => {
    if (editTitle.trim() && editTitle !== tab.title) {
      updateTab(tab.id, { title: editTitle.trim() });
    } else {
      setEditTitle(tab.title);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setEditTitle(tab.title);
      setIsEditing(false);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFixTab(tab.id);
  };

  const tabClassName = classNames(styles.tabItem, {
    [styles.active]: isActive,
    [styles.fixed]: tab.isFixed,
    [styles.dragging]: isDragging,
  });

  return (
    <Dropdown
      menu={{ items: contextMenuItems }}
      trigger={['contextMenu']}
      placement="bottomLeft"
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={tabClassName}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
      >
        {tab.isFixed && (
          <Tooltip title="已固定">
            <PushpinFilled
              className={styles.pinIcon}
              onClick={handlePinClick}
            />
          </Tooltip>
        )}

        {isEditing ? (
          <Input
            ref={inputRef}
            size="small"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleEditComplete}
            onKeyDown={handleEditKeyDown}
            className={styles.titleInput}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={styles.title} title={tab.title}>
            {tab.title}
          </span>
        )}

        {tab.closable && !tab.isFixed && (
          <CloseOutlined
            className={styles.closeIcon}
            onClick={handleCloseClick}
          />
        )}

        {!tab.isFixed && !tab.closable && (
          <Tooltip title="固定标签">
            <PushpinOutlined
              className={styles.pinIcon}
              onClick={handlePinClick}
            />
          </Tooltip>
        )}
      </div>
    </Dropdown>
  );
};

export default TabItem;