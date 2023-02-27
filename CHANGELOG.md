# Changelog

## [Unreleased]

### Fixed

* Parameters/expressions used for `groupBy` and `sortBy` options no longer show
  up as fields unless they're also explicitly included in the `fields` option.

### Modified

* Both `file.path` and `file.name` will now be displayed in bold if included in
  the field list, but *only* if they're the first field listed.

## [0.4.1] - 2023-02-11

### Added

* Added a `where` option to the gallery config to allow pages to be more
  easily filtered out.
* Added `this` value to all field evaluations (including `where` and `sortBy`).
  Previously, it was impossible to use `this` (e.g. `this.page.path`) to get
  details of the containing page.

## [0.4.0] - 2022-12-23

### Added

* Added a "clear" (❌) button to the filter/query bar.

### Modified

* If the `groupBy` field is a link, it will now be rendered as such.

### Fixed

* Links in the `groupBy` field were causing pages to not be grouped properly.

## [0.3.7] - 2022-12-12

### Fixed

* When the `sortBy` option was set to an array rather than a single value, the
  default "file.path" value was being prepended to whatever the user supplied,
  overriding the user-specified option(s).
* Creating a page gallery that included the containing page itself was causing
  an infinite loop of re-rendering.

## [0.3.6] - 2022-12-05

### Added

* Support for more image file types. Image types now supported:
  * JPG
  * PNG
  * GIF
  * BMP
  * WEBP

### Fixed

* Corrected the default `limit` (100) in the README and allowed it to be set to
  `null` to display all matched pages.

## [0.3.5] - 2022-12-05

### Fixed

* Caching of tile info was causing changes to the page-gallery config (such
  as modifications to the list of fields) not to be applied.

## [0.3.4] - 2022-12-01

### Added

* Implemented the `groupBy` config field.
* Reverse/descending sort order (e.g. `sortBy: -file.name`).
* You can now use [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview)
  expressions as fields.
  * This also works in `sortBy` and `groupBy` settings.
* Tile info is now cached in-memory and only updated when the associated page
  has changed, dramatically speeding up updates to the page gallery.

### Fixed

* Can now sort by nested fields (e.g. `file.name`).

### Modified

* Significant refactoring of pages-to-tiles logic in new `TileWrangler` class.

## [0.3.3] - 2022-11-21

### Modified

* Updated the example in the README.

### Fixed

* Removed stray debug code.

## [0.3.2] - 2022-11-21

### Added

* Added an `orientation` option to set the default aspect ratio to "portrait"
  or "landscape" mode.
* Added a `filter` (boolean) option to toggle the filter bar on/off.

### Modified

* The `from` clause can now use multiline YAML strings (`>` or `|`) to allow
  better formatting of long "from" clauses (e.g. listing each source on a
  separate line).

## [0.3.1] - 2022-11-20

### Fixed

* Restored the hover opacity toggle.

## [0.3.0] - 2022-11-20

### Added

* Added `sortBy` config option.
* Made certain image options (`size`, `position` and `repeat`) overridable on
  individual pages via page metadata/frontmatter.

### Modified

* **BREAKING** Using YAML rather than TOML for config language.
* Reimplementing image config/sizing options.

## [0.2.3] - 2022-11-14

### Added

* Added a `columns` config field to set the default (max) column count, as an
  alternative to explicitly setting the image width.

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