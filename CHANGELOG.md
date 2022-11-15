# Changelog

## [0.2.2] - 2022-11-14

### Modified

* Cleaner (IMO) default styles, including calculating default column width from
  container width, and flexibly breaking columns for smaller screens.
* Block-specific image settings are now controlled by CSS vars on the root
  `.page-gallery` element.
* If the `file.name` is displayed via the `fields` setting, it will no longer
  be rendered as markdown. This avoids issues when pages with names starting
  with numbers were being treated as numbered lists.

## [0.2.1] - 2022-11-10

### Modified

* Using obsidian's built-in `debounce` instead of [debounce](https://www.npmjs.com/package/debounce).
* Moved default image sizes to styles.css.
* Moved styles out of svelte components and into styles.css to make them easier
  to override.

## [0.2.0] - 2022-11-09

### Added

* Mobile support! Tested in iPad (2019) and Android (Pixel 6) so far.

### Modified

* Reimplementing on top of [Quorafind/Obsidian-Svelte-Starter](https://github.com/Quorafind/Obsidian-Svelte-Starter)
  to get it working on mobile devices.

## [0.1.1] - 2022-11-08

### Modified

* Removed `path` dependency.

## [0.1.0] - 2022-11-03

### Added

* Filter bar to search for pages by tags or name/path.

## [0.0.3] - 2022-11-03

### Modified

* Refactored to use [Svelte](https://svelte.dev/) for views.

## [0.0.2] - 2022-11-01

### Added

* Page galleries now auto-update when obsidian-dataview metadata is updated.

### Modified

* Refactored gallery rendering into separate view model.

## [0.0.1] - 2022-10-30

Initial release.