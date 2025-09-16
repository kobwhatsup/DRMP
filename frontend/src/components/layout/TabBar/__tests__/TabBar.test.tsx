import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TabBar from '../index';
import { useTabStore } from '@/store/tabStore';

// Mock the router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/test',
    search: '',
    hash: '',
    state: null,
  }),
}));

describe('TabBar Component', () => {
  beforeEach(() => {
    // Reset the tab store before each test
    const store = useTabStore.getState();
    store.tabs = [];
    store.activeTabId = null;
    store.recentlyClosed = [];
  });

  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <TabBar />
      </BrowserRouter>
    );

    // Check if add tab button is present
    const addButton = screen.getByRole('button', { name: /新建标签页/i });
    expect(addButton).toBeInTheDocument();
  });

  test('can add a new tab', () => {
    render(
      <BrowserRouter>
        <TabBar />
      </BrowserRouter>
    );

    // Click the add tab button
    const addButton = screen.getByRole('button', { name: /新建标签页/i });
    fireEvent.click(addButton);

    // Check if the new tab is created
    const store = useTabStore.getState();
    expect(store.tabs.length).toBe(1);
    expect(store.tabs[0].title).toBe('工作台');
    expect(store.tabs[0].path).toBe('/dashboard');
  });

  test('can close a tab', async () => {
    // Add a tab first
    const store = useTabStore.getState();
    const tabId = store.addTab({
      title: 'Test Tab',
      path: '/test',
      closable: true,
    });

    render(
      <BrowserRouter>
        <TabBar />
      </BrowserRouter>
    );

    // Find and click the close icon
    const closeIcon = document.querySelector('.closeIcon');
    if (closeIcon) {
      fireEvent.click(closeIcon);
    }

    // Check if the tab was removed
    await waitFor(() => {
      expect(store.tabs.length).toBe(0);
    });
  });

  test('can pin/unpin a tab', () => {
    // Add a tab first
    const store = useTabStore.getState();
    const tabId = store.addTab({
      title: 'Test Tab',
      path: '/test',
      closable: true,
    });

    render(
      <BrowserRouter>
        <TabBar />
      </BrowserRouter>
    );

    // Find and click the pin icon
    const pinIcon = document.querySelector('.pinIcon');
    if (pinIcon) {
      fireEvent.click(pinIcon);

      // Check if the tab is now fixed
      const updatedStore = useTabStore.getState();
      const tab = updatedStore.tabs.find(t => t.id === tabId);
      expect(tab?.isFixed).toBe(true);
    }
  });

  test('displays multiple tabs correctly', () => {
    const store = useTabStore.getState();

    // Add multiple tabs
    store.addTab({ title: 'Tab 1', path: '/tab1', closable: true });
    store.addTab({ title: 'Tab 2', path: '/tab2', closable: true });
    store.addTab({ title: 'Tab 3', path: '/tab3', closable: true });

    render(
      <BrowserRouter>
        <TabBar />
      </BrowserRouter>
    );

    // Check if all tabs are displayed
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  test('highlights active tab', () => {
    const store = useTabStore.getState();

    // Add tabs
    const tab1Id = store.addTab({ title: 'Tab 1', path: '/tab1', closable: true });
    const tab2Id = store.addTab({ title: 'Tab 2', path: '/tab2', closable: true });

    // Set tab 1 as active
    store.setActiveTab(tab1Id);

    render(
      <BrowserRouter>
        <TabBar />
      </BrowserRouter>
    );

    // Check if the active tab has the active class
    const tab1Element = screen.getByText('Tab 1').closest('.tabItem');
    expect(tab1Element).toHaveClass('active');

    const tab2Element = screen.getByText('Tab 2').closest('.tabItem');
    expect(tab2Element).not.toHaveClass('active');
  });

  test('can restore recently closed tab', async () => {
    const store = useTabStore.getState();

    // Add and remove a tab
    const tabId = store.addTab({ title: 'Closed Tab', path: '/closed', closable: true });
    store.removeTab(tabId);

    render(
      <BrowserRouter>
        <TabBar />
      </BrowserRouter>
    );

    // Check if tab was added to recently closed
    expect(store.recentlyClosed.length).toBe(1);
    expect(store.recentlyClosed[0].title).toBe('Closed Tab');

    // Restore the tab
    store.restoreClosedTab();

    // Check if tab was restored
    await waitFor(() => {
      expect(store.tabs.length).toBe(1);
      expect(store.tabs[0].title).toBe('Closed Tab');
    });
  });
});