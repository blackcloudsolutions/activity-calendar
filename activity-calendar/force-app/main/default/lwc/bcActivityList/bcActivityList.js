import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getActivities from '@salesforce/apex/BCAC_ActivityController.getActivities';

// Labels
import TaskLabel  from '@salesforce/label/c.BCAC_Task';
import EventLabel from '@salesforce/label/c.BCAC_Event';
import CallLabel  from '@salesforce/label/c.BCAC_Call';
import EmailLabel from '@salesforce/label/c.BCAC_Email';
import ShowMoreLabel from '@salesforce/label/c.BCAC_ShowMore';
import ShowLessLabel from '@salesforce/label/c.BCAC_ShowLess';

const INITIAL_LIMIT = 5;

export default class BcActivityList extends NavigationMixin(LightningElement) {
  // recordId: refresh when it becomes available or changes
  _recordId;
  @api
  get recordId() { return this._recordId; }
  set recordId(val) {
    const changed = val !== this._recordId;
    this._recordId = val;
    if (changed && this._recordId) {
      // eslint-disable-next-line no-console
      console.log('[bcActivityList] recordId set:', this._recordId);
      this.refresh();
    }
  }
  @api title = 'Activity List';
  @track items = [];        // full set from Apex
  @track visibleItems = []; // rendered subset
  @track loading = false;
  @track error;
  showAll = false;

  // chips on by default
  filters = { task: true, event: true, call: true, email: true };

  // label getters
  get labelTask()     { return TaskLabel; }
  get labelEvent()    { return EventLabel; }
  get labelCall()     { return CallLabel; }
  get labelEmail()    { return EmailLabel; }

  // dynamic button label: flips between Show more / Show less
  get showToggleLabel() {
    return this.showAll ? ShowLessLabel : ShowMoreLabel;
  }

  // chip classes
  get chipClassTask()  { return this.filters.task  ? 'legend-item chip active' : 'legend-item chip inactive'; }
  get chipClassEvent() { return this.filters.event ? 'legend-item chip active' : 'legend-item chip inactive'; }
  get chipClassCall()  { return this.filters.call  ? 'legend-item chip active' : 'legend-item chip inactive'; }
  get chipClassEmail() { return this.filters.email ? 'legend-item chip active' : 'legend-item chip inactive'; }

  get selectedTypes() {
    const t = [];
    if (this.filters.task)  t.push('Task');
    if (this.filters.event) t.push('Event');
    if (this.filters.call)  t.push('Call');
    if (this.filters.email) t.push('Email');
    return t;
  }

  // If the component mounts with recordId already present, do an initial fetch
  connectedCallback() {
    if (this._recordId) {
      this.refresh();
    }
  }

  async refresh() {
    if (!this._recordId) {
      // eslint-disable-next-line no-console
      console.log('[bcActivityList] refresh skipped — no recordId yet');
      return;
    }

    this.loading = true;
    this.error = undefined;
    this.items = [];
    this.visibleItems = [];
    this.showAll = false;

    try {
      const result = await getActivities({
        recordId: this._recordId,
        startDate: null,  // fetch ALL dates
        endDate: null,
        types: this.selectedTypes
      });

      const mapped = (result || []).map(r => ({
        id: r.id,
        type: r.type,
        subject: r.subject || '(no subject)',
        when: new Date(r.whenAt),
        whenFormatted: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
          .format(new Date(r.whenAt)),
        dotClass: 'dot ' + String(r.type || '').toLowerCase()
      }));

      // Newest first (feed-style)
      mapped.sort((a, b) => b.when - a.when);

      this.items = mapped;
      this.updateVisibleItems();

      // eslint-disable-next-line no-console
      console.log('[bcActivityList] fetched:', mapped.length, 'record(s) for', this._recordId, 'types=', this.selectedTypes);
    } catch (e) {
      this.error = e?.body?.message || e.message;
      // eslint-disable-next-line no-console
      console.error('[bcActivityList] error', e);
    } finally {
      this.loading = false;
    }
  }

  updateVisibleItems() {
    this.visibleItems = this.showAll ? this.items : this.items.slice(0, INITIAL_LIMIT);
  }

  handleShowMore() {
    this.showAll = !this.showAll;
    this.updateVisibleItems();
  }

  onChipClick = (evt) => {
    const t = evt.currentTarget?.dataset?.type;
    if (!t) return;
    this.filters[t] = !this.filters[t];
    this.refresh();
  }

  onChipKey = (evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      this.onChipClick(evt);
    }
  }

  onRowClick = (evt) => {
    const id = evt.currentTarget?.dataset?.id;
    if (!id) return;
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: { recordId: id, actionName: 'view' }
    });
  }

  onRowKey = (evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      this.onRowClick(evt);
    }
  }

  get hasExtra() {
    return this.items.length > INITIAL_LIMIT;
  }
}
