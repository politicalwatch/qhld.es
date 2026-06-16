export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'zinc',
    },
    toast: {
      slots: {
        root: 'qhld-toast',
      },
    },
    selectMenu: {
      slots: {
        base: 'qhld-select__trigger',
        value: 'qhld-select__value',
        placeholder: 'qhld-select__placeholder',
        trailingIcon: 'qhld-select__chevron',
        content: 'qhld-select__panel',
        viewport: 'qhld-select__viewport',
        item: 'qhld-select__option',
        itemLabel: 'qhld-select__option-label',
        input: 'qhld-select__search',
        empty: 'qhld-select__empty',
      },
    },
  },
})
