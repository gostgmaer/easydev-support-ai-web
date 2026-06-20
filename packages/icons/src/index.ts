import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  MessageSquare,
  Inbox,
  Sparkles,
  GitBranch,
  Ticket,
  BarChart3,
  Link,
  Wifi,
  WifiOff,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Send,
  Paperclip,
  Clock,
  UserCheck,
  Zap,
  TrendingUp,
  FileText,
  DollarSign,
  ChevronRight,
  Search,
  Activity,
  History,
  Archive,
  Terminal,
  LogOut,
  FolderOpen
} from 'lucide-react';

export const Icons = {
  // Navigation Icons
  Dashboard: LayoutDashboard,
  Users: Users,
  Settings: Settings,
  Security: Shield,
  Support: MessageSquare,
  History: History,
  LogOut: LogOut,

  // Inbox & Chat Icons
  Inbox: Inbox,
  Send: Send,
  Attachment: Paperclip,
  Clock: Clock,
  ReadReceipt: UserCheck,
  Search: Search,
  Archive: Archive,
  Folder: FolderOpen,

  // Contextual Status
  Online: Wifi,
  Offline: WifiOff,
  User: User,
  Success: CheckCircle,
  Warning: AlertTriangle,
  Error: XCircle,
  Help: HelpCircle,
  Activity: Activity,

  // AI & Workflow Icons
  AiSparkles: Sparkles,
  WorkflowBranch: GitBranch,
  Trigger: Zap,
  Terminal: Terminal,
  Cost: DollarSign,

  // Operations
  Ticket: Ticket,
  Analytics: BarChart3,
  Connector: Link,
  Trend: TrendingUp,
  Report: FileText,
  ArrowRight: ChevronRight
};

export type IconType = keyof typeof Icons;
