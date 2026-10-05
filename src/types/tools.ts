export type EditorTool = 
  | 'selection'    // V - Selection Tool
  | 'trackSelect'  // A - Track Select Forward
  | 'ripple'       // B - Ripple Edit Tool
  | 'razor'        // C - Razor Tool
  | 'slip'         // Y - Slip Tool
  | 'pen'          // P - Pen Tool (Masks & Keyframes)
  | 'hand'         // H - Hand Tool (Pan)
  | 'type';        // T - Type Tool

export type WorkspaceTab = 
  | 'editing'
  | 'color'
  | 'effects'
  | 'audio'
  | 'graphics'
  | 'export';

export type MonitorTab = 'program' | 'source' | 'scopes';
