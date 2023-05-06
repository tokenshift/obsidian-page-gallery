# Changelog

## [0.7.1] - 2023-05-05

### Fixed

* The page gallery will load immediately on first load, rather than waiting
  (indefinitely) for all filesystem updates to settle down. This was causing
  galleries to not render at all if Obsidian Sync was still running in the
  background, which can take a while.
* Removed caching. It was crashing Obsidian due to OOM errors on really large
  galleries, and no longer improves performance that much due to previous
  changes. Will re-evaluate caching options in the future if I can find a good
  caching or embedded DB library that doesn't cause the same OOM errors on large
  galleries, and actually manages to be faster than just re-rendering/re-evaluating
  expressions when needed.

## [0.7.0] - 2023-05-04

### Modified

* Tile images and field values are now lazy-loaded when the tile is visible.
  This dramatically increases performance on large page galleries.
* Updates to the filter string are now debounced to keep the UI from freezing
  up repeatedly as you type.
* Miscellaneous additional performance improvements for large galleries.

## [0.6.2] - 2023-05-01

### Fixed

* Resolved issue with dirnames on mobile devices.

## [0.6.1] - 2023-05-01

### Fixed

* Links in string field values are now rendered properly.

## [0.6.0] - 2023-05-01

### Added

* New `mode` option to choose whether you want to display images, note content,
  or images with note content as a fallback if no image is detected (the new
  default).

## [0.5.5] - 2023-03-15

### Added

* New `radius` option to change the border radius of individual tiles, if you
  don't want rounded corners (or want them to be bigger/smaller).

### Modified

* Page gallery title and group headings now us `<h2>` and `<h3>` elements to
  match configured page styles, rather than custom styling.

## [0.5.4] - 2023-03-10

### Fixed

* `groupBy` option now behaves correctly when the group by value is a link to
  a page.
* `groupBy` values are now rendered as markdown in certain cases, including
  links and tags.
* Single tags as field values are now rendered correctly.

## [0.5.3] - 2023-03-06

### Fixed

* Page galleries weren't displaying right on first load of Obsidian because they
  were trying to display before obsidian-dataview had initialized its index.

## [0.5.2] - 2023-03-05

### Fixed

* Fields with zero-values (`0`) are no longer treated as missing/null, and will
  sort correctly with other numbers.

## [0.5.1] - 2023-03-05

### Modified

* Replaced `node-cache` with custom LRU-based cache for mobile compatibility.

## [0.5.0] - 2023-03-03

### Added

* Multiple views (or tabs) can now be defined using the `views` setting in the
  page gallery config. The `views` setting is a list of configuration blocks,
  each accepting largely the same options as the previous root config, plus a
  `name` option for each tab. Any options defined at the root config will be
  treated as defaults for every view. If no views are defined, a single implicit
  one will be created using values defined in the root config object, so if you
  just want a single-view page gallery (as was previously the only option), you
  don't have to worry about restructuring all of your `page-gallery` blocks.

## [0.4.2] - 2023-02-27

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