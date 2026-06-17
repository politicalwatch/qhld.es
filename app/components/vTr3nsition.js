/**
 * directives for declarative transitions  using d3 libraries.
 *  In the future this will be a standalone library for vue3.
 *  sergiogalan at graphicmethod dot studio
 **/

import * as easing from 'd3-ease';
import { timer } from 'd3-timer';
import { interpolate } from 'd3-interpolate';
const vTr3nsition = {
  beforeMount: (el, binding) => {
    if (binding.arg === 'init') {
      Object.keys(binding.value).forEach((key) => {
        if (key === 'transition') return;
        el.setAttribute(key, binding.value[key]);
      });
    }
  },
  mounted: (el, binding) => {
    if (binding.arg === 'to') {
      const duration = binding.value.transition?.duration ?? 1000;
      const delay = binding.value.transition?.delay ?? 0;
      const ease = binding.value.transition?.ease ?? 'easeCubic';
      Object.keys(binding.value).forEach((key) => {
        if (key === 'transition') return;
        // el.setAttribute(key, binding.value[key]);
        const interpolator = interpolate(
          el.getAttribute(key),
          binding.value[key]
        );
        const te = easing[ease] ?? easing.easeCubic;

        const t = timer((elapsed) => {
          const normalizedTime = elapsed / duration;
          el.setAttribute(key, interpolator(te(normalizedTime)));
          if (elapsed > duration) t.stop();
        }, delay);
      });
    }    
   
  },
  updated: (el, binding) => {
    if (binding.arg === 'to') {
      const duration = binding.value.transition?.duration ?? 1000;
      const delay = binding.value.transition?.delay ?? 0;
      const ease = binding.value.transition?.ease ?? 'easeCubic';
      Object.keys(binding.value).forEach((key) => {
        if (key === 'transition') return;
        // el.setAttribute(key, binding.value[key]);
        const interpolator = interpolate(
          binding.oldValue[key],
          binding.value[key]
        );
        const te = easing[ease] ?? easing.easeCubic;

        const t = timer((elapsed) => {
          const normalizedTime = elapsed / duration;
          el.setAttribute(key, interpolator(te(normalizedTime)));
          if (elapsed > duration) t.stop();
        }, delay);
      });
    }    
  }
};

export default vTr3nsition;
