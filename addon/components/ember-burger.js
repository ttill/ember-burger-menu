import Ember from 'ember';
import layout from '../templates/components/ember-burger';
import menuFor from 'ember-burger-menu';
import cssStringify from 'ember-burger-menu/utils/css-stringify';

const {
  $,
  on,
  run,
  observer,
  computed
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['ember-burger-menu'],
  classNameBindings: ['menuId', 'isOpen', 'translucentOverlay', 'animation', 'position'],
  attributeBindings: ['style'],

  menuId: 'main',
  state: computed(function() {
    return menuFor(this.get('menuId'));
  }).readOnly(),

  isOpen: computed.alias('state.isOpen'),
  animation: computed.alias('state.animation'),
  position: computed.alias('state.position'),
  width: computed.alias('state.width'),
  translucentOverlay: true,
  dismissOnClick: true,

  style: computed('state.isOpen', 'state.styles', function() {
    let openState = this.get('state.isOpen') ? 'open' : 'closed';
    let styles = this.get('state.styles');

    return cssStringify(styles[openState].container);
  }).readOnly(),

  setupEvents: on('didInsertElement', observer('isOpen', function() {
    if (this.get('isOpen') && this.get('dismissOnClick')) {
      this._clickSetupTimer = run.scheduleOnce('afterRender', this, 'setupClick');
    }
  })),

  destroy() {
    this._super(...arguments);
    run.cancel(this._clickSetupTimer);
  },

  setupClick() {
    this.__click = this._click.bind(this);
    this.$().on('click.bm', this.__click);
    this.$().on('touchstart.bm', this.__click);
  },

  teardownClick() {
    this.$().off('click.bm', this.__click);
    this.$().off('touchstart.bm', this.__click);
  },

  _click(e) {
    let state = this.get('state');

    if ($(e.target).closest('.bm-menu', this.$()).length === 0) {
      e.stopPropagation();
      e.preventDefault();

      state.set('isOpen', false);
      this.teardownClick();
    }
  }
});