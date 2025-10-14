import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getActivities from '@salesforce/apex/BCAC_ActivityController.getActivities';

// Labels
import TaskLabel from '@salesforce/label/c.BCAC_Task';
import EventLabel from '@salesforce/label/c.BCAC_Event';
import CallLabel from '@salesforce/label/c.BCAC_Call';
import EmailLabel from '@salesforce/label/c.BCAC_Email';
import ActivitiesLabel from '@salesforce/label/c.BCAC_Activities';
import ShowMoreLabel from '@salesforce/label/c.BCAC_ShowMore';
import ClearDayFilterLabel from '@salesforce/label/c.BCAC_ClearDayFilter';

export default class ActivityMonthView extends NavigationMixin(LightningElement) {
  @api recordId;
  @api title = 'Activity Calendar';
  @track cells = [];
  filters = { task: true, call: true, event: true, email: true };

  rawItems = [];

  panelOpen = false;
  selectedDateKey = '';
  showAllMonth = false;
  PREVIEW_COUNT = 5;

  current = new Date();
  weekdayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  connectedCallback() { this.refresh(); }

  // Label getters
  get labelTask() { return TaskLabel; }
  get labelEvent() { return EventLabel; }
  get labelCall() { return CallLabel; }
  get labelEmail() { return EmailLabel; }
  get labelActivities() { return ActivitiesLabel; }
  get labelShowMore() { return ShowMoreLabel; }
  get labelClearDayFilter() { return ClearDayFilterLabel; }

  // Chip classes
  get chipClassTask()  { return this.filters.task  ? 'legend-item chip active' : 'legend-item chip inactive'; }
  get chipClassEvent() { return this.filters.event ? 'legend-item chip active' : 'legend-item chip inactive'; }
  get chipClassCall()  { return this.filters.call  ? 'legend-item chip active' : 'legend-item chip inactive'; }
  get chipClassEmail() { return this.filters.email ? 'legend-item chip active' : 'legend-item chip inactive'; }

  get monthLabel() {
    return this.current.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }
  get hasSelectedDay() { return !!this.selectedDateKey; }
  get panelIcon()     { return this.panelOpen ? 'utility:chevrondown' : 'utility:chevronright'; }

  // Live counts from rawItems
  get selectedCount() {
    if (!this.selectedDateKey) return 0;
    return this.rawItems.filter((r) => r.key === this.selectedDateKey && this.selectedTypes.includes(r.type)).length;
  }
  get monthCount() {
    return this.rawItems.filter((r) => this.selectedTypes.includes(r.type)).length;
  }

  get panelTitle() {
    if (this.hasSelectedDay) {
      return `${this.labelActivities} — ${this.selectedDateLabel} (${this.selectedCount})`;
    }
    return `${this.monthLabel} ${this.labelActivities} (${this.monthCount})`;
  }

  get selectedDateLabel() {
    if (!this.selectedDateKey) return '';
    const [yyyy, mm, dd] = this.selectedDateKey.split('-').map(Number);
    const dt = new Date(yyyy, mm - 1, dd);
    return dt.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get selectedTypes() {
    const t = [];
    if (this.filters.task)  t.push('Task');
    if (this.filters.call)  t.push('Call');
    if (this.filters.event) t.push('Event');
    if (this.filters.email) t.push('Email');
    return t;
  }

  async refresh() {
    const start = new Date(this.current.getFullYear(), this.current.getMonth(), 1);
    const end   = new Date(this.current.getFullYear(), this.current.getMonth() + 1, 0);

    const toSFDate = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const result = await getActivities({
      recordId: this.recordId,
      startDate: toSFDate(start),
      endDate: toSFDate(end),
      types: this.selectedTypes
    });

    this.rawItems = (result || []).map((r) => {
      const dt = new Date(r.whenAt);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      return { id: r.id, type: r.type, subject: r.subject || '(no subject)', whenAt: dt, key };
    });

    const byDay = new Map();
    this.rawItems.forEach((r) => {
      if (!byDay.has(r.key)) byDay.set(r.key, []);
      byDay.get(r.key).push(r.type);
    });

    this.buildGrid(start, end, byDay);

    if (this.panelOpen) {
      if (this.hasSelectedDay) this.computeSelectedItems();
      else this.computeMonthItems();
    }
  }

  buildGrid(start, end, byDay) {
    const firstDow = (start.getDay() + 6) % 7;
    const daysInMonth = end.getDate();
    const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

    this.cells = Array.from({ length: totalCells }, (_, i) => {
      const daynum = i - firstDow + 1;
      const inMonth = daynum >= 1 && daynum <= daysInMonth;

      if (!inMonth) return { key: i, day: '', dots: [], tooltip: '', tabIndex: -1, cellClass: 'cell' };

      const yyyy = start.getFullYear();
      const mm = String(start.getMonth() + 1).padStart(2, '0');
      const dd = String(daynum).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;

      const typesRaw = byDay.get(key) || [];
      const seen = {};
      const uniqueTypes = [];
      for (const t of typesRaw) if (!seen[t]) { seen[t] = true; uniqueTypes.push(t); }

      const dots = uniqueTypes.map((t) => `dot ${t.toLowerCase()}`);
      const tooltip = typesRaw.length
        ? Object.entries(typesRaw.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {}))
            .map(([k, v]) => `${v} ${k}${v > 1 ? 's' : ''}`)
            .join(', ')
        : '';

      return { key: `${i}-${daynum}`, day: daynum, dots, tooltip, tabIndex: 0, cellClass: 'cell clickable' };
    });
  }

  computeSelectedItems() {
    this._selectedItems = this.rawItems
      .filter((r) => r.key === this.selectedDateKey && this.selectedTypes.includes(r.type))
      .sort((a, b) => a.whenAt - b.whenAt)
      .map((r) => ({
        id: r.id,
        type: r.type,
        subject: r.subject,
        time: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(r.whenAt),
        dotClass: `dot ${r.type.toLowerCase()}`
      }));
  }

  computeMonthItems() {
    this._monthItems = this.rawItems
      .filter((r) => this.selectedTypes.includes(r.type))
      .sort((a, b) => b.whenAt - a.whenAt)
      .map((r) => ({
        id: r.id,
        type: r.type,
        subject: r.subject,
        time: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(r.whenAt),
        dotClass: `dot ${r.type.toLowerCase()}`
      }));
  }

  get displayedItems() {
    if (!this.panelOpen) return [];
    if (this.hasSelectedDay) return this._selectedItems || [];
    if (!this._monthItems) return [];
    return this.showAllMonth ? this._monthItems : this._monthItems.slice(0, this.PREVIEW_COUNT);
  }

  get showMonthShowMore() {
    return this.panelOpen && !this.hasSelectedDay && !this.showAllMonth && this.monthCount > this.PREVIEW_COUNT;
  }

  prevMonth() { this.current = new Date(this.current.getFullYear(), this.current.getMonth() - 1, 1); this.panelOpen = false; this.selectedDateKey = ''; this.showAllMonth = false; this.refresh(); }
  nextMonth() { this.current = new Date(this.current.getFullYear(), this.current.getMonth() + 1, 1); this.panelOpen = false; this.selectedDateKey = ''; this.showAllMonth = false; this.refresh(); }

  onChipClick = (evt) => {
    const t = evt.currentTarget?.dataset?.type;
    if (!t) return;
    this.filters[t] = !this.filters[t];
    if (this.panelOpen) {
      if (this.hasSelectedDay) this.computeSelectedItems();
      else this.computeMonthItems();
    }
    this.refresh();
  }
  onChipKey = (evt) => { if (evt.key === 'Enter' || evt.key === ' ') { evt.preventDefault(); this.onChipClick(evt); } }

  onCellClick = (evt) => {
    const day = evt.currentTarget?.dataset?.day;
    if (!day) return;
    const yyyy = this.current.getFullYear();
    const mm = String(this.current.getMonth() + 1).padStart(2, '0');
    const dd = String(Number(day)).padStart(2, '0');
    this.selectedDateKey = `${yyyy}-${mm}-${dd}`;
    this.panelOpen = true;
    this.showAllMonth = false;
    this.computeSelectedItems();
  }
  onCellKey = (evt) => { if (evt.key === 'Enter' || evt.key === ' ') { evt.preventDefault(); this.onCellClick(evt); } }

  togglePanel = () => { 
    this.panelOpen = !this.panelOpen; 
    if (this.panelOpen) {
      if (this.hasSelectedDay) this.computeSelectedItems();
      else { this.computeMonthItems(); this.showAllMonth = false; }
    }
  }
  clearDayFilter = () => { this.selectedDateKey = ''; this.showAllMonth = false; if (this.panelOpen) this.computeMonthItems(); }
  showMoreMonth = () => { this.showAllMonth = true; }

  handleGo = (evt) => {
    const id = evt.currentTarget?.dataset?.id;
    if (!id) return;
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: { recordId: id, actionName: 'view' }
    });
  }
}