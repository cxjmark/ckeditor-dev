/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.dialog.add( 'cellProperties', function( editor ) {
	var langTable = editor.lang.table,
		langCell = langTable.cell,
		langCommon = editor.lang.common,
		validate = CKEDITOR.dialog.validate,
		widthPattern = /^(\d+(?:\.\d+)?)(px|%)$/,
		rtl = editor.lang.dir == 'rtl',
		colorDialog = editor.plugins.colordialog,
		firstColumn = {
			type: 'vbox',
			requiredContent: [ 'td{width,height}', 'td{white-space}', 'td{text-align}', 'td{vertical-align}' ],
			padding: 0,
			children: [ {
				type: 'hbox',
				widths: [ '70%', '30%' ],
				children: [ {
					type: 'text',
					id: 'width',
					width: '100px',
					requiredContent: 'td{width,height}',
					label: langCommon.width,
					validate: validate.number( langCell.invalidWidth ),

					// Extra labelling of width unit type.
					onLoad: function() {
						var widthType = this.getDialog().getContentElement( 'info', 'widthType' ),
							labelElement = widthType.getElement(),
							inputElement = this.getInputElement(),
							ariaLabelledByAttr = inputElement.getAttribute( 'aria-labelledby' );

						inputElement.setAttribute( 'aria-labelledby', [ ariaLabelledByAttr, labelElement.$.id ].join( ' ' ) );
					},

					setup: setupCells( function( element ) {
						var widthAttr = parseInt( element.getAttribute( 'width' ), 10 ),
							widthStyle = parseInt( element.getStyle( 'width' ), 10 );

						return !isNaN( widthStyle ) ? widthStyle :
							!isNaN( widthAttr ) ? widthAttr : '';
					} ),
					commit: function( element ) {
						var value = parseInt( this.getValue(), 10 ),

							// There might be no widthType value, i.e. when multiple cells are
							// selected but some of them have width expressed in pixels and some
							// of them in percent. Try to re-read the unit from the cell in such
							// case (https://dev.ckeditor.com/ticket/11439).
							unit = this.getDialog().getValueOf( 'info', 'widthType' ) || getCellWidthType( element );

						if ( !isNaN( value ) )
							element.setStyle( 'width', value + unit );
						else
							element.removeStyle( 'width' );

						element.removeAttribute( 'width' );
					},
					'default': ''
				},
					{
						type: 'select',
						id: 'widthType',
						requiredContent: 'td{width,height}',
						label: editor.lang.table.widthUnit,
						labelStyle: 'visibility:hidden',
						'default': 'px',
						items: [
							[ langTable.widthPx, 'px' ],
							[ langTable.widthPc, '%' ]
						],
						setup: setupCells( getCellWidthType )
					} ]
			},
				{
					type: 'hbox',
					widths: [ '70%', '30%' ],
					children: [ {
						type: 'text',
						id: 'height',
						requiredContent: 'td{width,height}',
						label: langCommon.height,
						width: '100px',
						'default': '',
						validate: validate.number( langCell.invalidHeight ),

						// Extra labelling of height unit type.
						onLoad: function() {
							var heightType = this.getDialog().getContentElement( 'info', 'htmlHeightType' ),
								labelElement = heightType.getElement(),
								inputElement = this.getInputElement(),
								ariaLabelledByAttr = inputElement.getAttribute( 'aria-labelledby' );

							if ( this.getDialog().getContentElement( 'info', 'height' ).isVisible() ) {
								labelElement.setHtml( '<br />' + langTable.widthPx );
								labelElement.setStyle( 'display', 'block' );

								this.getDialog().getContentElement( 'info', 'hiddenSpacer' ).getElement().setStyle( 'display', 'block' );
							}

							inputElement.setAttribute( 'aria-labelledby', [ ariaLabelledByAttr, labelElement.$.id ].join( ' ' ) );
						},

						setup: setupCells( function( element ) {
							var heightAttr = parseInt( element.getAttribute( 'height' ), 10 ),
								heightStyle = parseInt( element.getStyle( 'height' ), 10 );

							return !isNaN( heightStyle ) ? heightStyle :
								!isNaN( heightAttr ) ? heightAttr : '';
						} ),
						commit: function( element ) {
							var value = parseInt( this.getValue(), 10 );

							if ( !isNaN( value ) )
								element.setStyle( 'height', CKEDITOR.tools.cssLength( value ) );
							else
								element.removeStyle( 'height' );

							element.removeAttribute( 'height' );
						}
					},
						{
							id: 'htmlHeightType',
							type: 'html',
							html: '',
							style: 'display: none'
						} ]
				},
				{
					type: 'html',
					id: 'hiddenSpacer',
					html: '&nbsp;',
					style: 'display: none'
				},
				{
					type: 'select',
					id: 'wordWrap',
					requiredContent: 'td{white-space}',
					label: langCell.wordWrap,
					'default': 'yes',
					items: [
						[ langCell.yes, 'yes' ],
						[ langCell.no, 'no' ]
					],
					setup: setupCells( function( element ) {
						var wordWrapAttr = element.getAttribute( 'noWrap' ),
							wordWrapStyle = element.getStyle( 'white-space' );

						if ( wordWrapStyle == 'nowrap' || wordWrapAttr )
							return 'no';
					} ),
					commit: function( element ) {
						if ( this.getValue() == 'no' )
							element.setStyle( 'white-space', 'nowrap' );
						else
							element.removeStyle( 'white-space' );

						element.removeAttribute( 'noWrap' );
					}
				},
				createSpacer( 'td{white-space}' ),
				{
					type: 'select',
					id: 'hAlign',
					requiredContent: 'td{text-align}',
					label: langCell.hAlign,
					'default': '',
					items: [
						[ langCommon.notSet, '' ],
						[ langCommon.left, 'left' ],
						[ langCommon.center, 'center' ],
						[ langCommon.right, 'right' ],
						[ langCommon.justify, 'justify' ]
					],
					setup: setupCells( function( element ) {
						var alignAttr = element.getAttribute( 'align' ),
							textAlignStyle = element.getStyle( 'text-align' );

						return textAlignStyle || alignAttr || '';
					} ),
					commit: function( selectedCell ) {
						var value = this.getValue();

						if ( value )
							selectedCell.setStyle( 'text-align', value );
						else
							selectedCell.removeStyle( 'text-align' );

						selectedCell.removeAttribute( 'align' );
					}
				},
				{
					type: 'select',
					id: 'vAlign',
					requiredContent: 'td{vertical-align}',
					label: langCell.vAlign,
					'default': '',
					items: [
						[ langCommon.notSet, '' ],
						[ langCommon.alignTop, 'top' ],
						[ langCommon.alignMiddle, 'middle' ],
						[ langCommon.alignBottom, 'bottom' ],
						[ langCell.alignBaseline, 'baseline' ]
					],
					setup: setupCells( function( element ) {
						var vAlignAttr = element.getAttribute( 'vAlign' ),
							vAlignStyle = element.getStyle( 'vertical-align' );

						switch ( vAlignStyle ) {
							// Ignore all other unrelated style values..
							case 'top':
							case 'middle':
							case 'bottom':
							case 'baseline':
								break;
							default:
								vAlignStyle = '';
						}

						return vAlignStyle || vAlignAttr || '';
					} ),
					commit: function( element ) {
						var value = this.getValue();

						if ( value )
							element.setStyle( 'vertical-align', value );
						else
							element.removeStyle( 'vertical-align' );

						element.removeAttribute( 'vAlign' );
					}
				} ]
		},

		secondColumn = {
			type: 'vbox',
			requiredContent: [ 'th', 'td[rowspan]', 'td[colspan]', 'td{background-color}', 'td{border-color}' ],
			padding: 0,
			children: [ {
				type: 'select',
				id: 'cellType',
				requiredContent: 'th',
				label: langCell.cellType,
				'default': 'td',
				items: [
					[ langCell.data, 'td' ],
					[ langCell.header, 'th' ]
				],
				setup: setupCells( function( selectedCell ) {
					return selectedCell.getName();
				} ),
				commit: function( selectedCell ) {
					selectedCell.renameNode( this.getValue() );
				}
			},
				createSpacer( 'th' ),
				{
					type: 'text',
					id: 'rowSpan',
					requiredContent: 'td[rowspan]',
					label: langCell.rowSpan,
					'default': '',
					validate: validate.integer( langCell.invalidRowSpan ),
					setup: setupCells( function( selectedCell ) {
						var attrVal = parseInt( selectedCell.getAttribute( 'rowSpan' ), 10 );
						if ( attrVal && attrVal != 1 )
							return attrVal;
					} ),
					commit: function( selectedCell ) {
						var value = parseInt( this.getValue(), 10 );
						if ( value && value != 1 )
							selectedCell.setAttribute( 'rowSpan', this.getValue() );
						else
							selectedCell.removeAttribute( 'rowSpan' );
					}
				},
				{
					type: 'text',
					id: 'colSpan',
					requiredContent: 'td[colspan]',
					label: langCell.colSpan,
					'default': '',
					validate: validate.integer( langCell.invalidColSpan ),
					setup: setupCells( function( element ) {
						var attrVal = parseInt( element.getAttribute( 'colSpan' ), 10 );
						if ( attrVal && attrVal != 1 )
							return attrVal;
					} ),
					commit: function( selectedCell ) {
						var value = parseInt( this.getValue(), 10 );
						if ( value && value != 1 )
							selectedCell.setAttribute( 'colSpan', this.getValue() );
						else
							selectedCell.removeAttribute( 'colSpan' );
					}
				},
				createSpacer( 'td[colspan]' ),
				{
					type: 'hbox',
					padding: 0,
					widths: [ '60%', '40%' ],
					requiredContent: 'td{background-color}',
					children: [ {
						type: 'text',
						id: 'bgColor',
						requiredContent: 'td{background-color}',
						label: langCell.bgColor,
						'default': '',
						setup: setupCells( function( element ) {
							var bgColorAttr = element.getAttribute( 'bgColor' ),
								bgColorStyle = element.getStyle( 'background-color' );

							return bgColorStyle || bgColorAttr;
						} ),
						commit: function( selectedCell ) {
							var value = this.getValue();

							if ( value )
								selectedCell.setStyle( 'background-color', this.getValue() );
							else
								selectedCell.removeStyle( 'background-color' );

							selectedCell.removeAttribute( 'bgColor' );
						}
					},
						colorDialog ? {
							type: 'button',
							id: 'bgColorChoose',
							'class': 'colorChooser', // jshint ignore:line
							label: langCell.chooseColor,
							onLoad: function() {
								// Stick the element to the bottom (https://dev.ckeditor.com/ticket/5587)
								this.getElement().getParent().setStyle( 'vertical-align', 'bottom' );
							},
							onClick: function() {
								editor.getColorFromDialog( function( color ) {
									if ( color )
										this.getDialog().getContentElement( 'info', 'bgColor' ).setValue( color );
									this.focus();
								}, this );
							}
						} : createSpacer() ]
				},
				createSpacer( 'td{background-color}' ),
				{
					type: 'hbox',
					padding: 0,
					widths: [ '60%', '40%' ],
					requiredContent: 'td{border-color}',
					children: [ {
						type: 'text',
						id: 'borderColor',
						requiredContent: 'td{border-color}',
						label: langCell.borderColor,
						'default': '',
						setup: setupCells( function( element ) {
							var borderColorAttr = element.getAttribute( 'borderColor' ),
								borderColorStyle = element.getStyle( 'border-color' );

							return borderColorStyle || borderColorAttr;
						} ),
						commit: function( selectedCell ) {
							var value = this.getValue();
							if ( value )
								selectedCell.setStyle( 'border-color', this.getValue() );
							else
								selectedCell.removeStyle( 'border-color' );

							selectedCell.removeAttribute( 'borderColor' );
						}
					},

						colorDialog ? {
							type: 'button',
							id: 'borderColorChoose',
							'class': 'colorChooser', // jshint ignore:line
							label: langCell.chooseColor,
							style: ( rtl ? 'margin-right' : 'margin-left' ) + ': 10px',
							onLoad: function() {
								// Stick the element to the bottom (https://dev.ckeditor.com/ticket/5587)
								this.getElement().getParent().setStyle( 'vertical-align', 'bottom' );
							},
							onClick: function() {
								editor.getColorFromDialog( function( color ) {
									if ( color )
										this.getDialog().getContentElement( 'info', 'borderColor' ).setValue( color );
									this.focus();
								}, this );
							}
						} : createSpacer() ]
				} ]
		},

	children = [ firstColumn, secondColumn ];

	if ( getColumnsCount() === 2 ) {
		children.splice( 1, 0, createSpacer() );
	}

	return {
		title: langCell.title,
		minWidth: getColumnsCount() * 205,
		minHeight: 50,
		contents: [ {
			id: 'info',
			label: langCell.title,
			accessKey: 'I',
			elements: [ {
				type: 'hbox',
				widths: getWidths(),
				children: children
			} ]
		} ],
		onShow: function() {
			this.cells = CKEDITOR.plugins.tabletools.getSelectedCells( this._.editor.getSelection() );
			this.setupContent( this.cells );
		},
		onOk: function() {
			var selection = this._.editor.getSelection(),
				bookmarks = selection.createBookmarks();

			var cells = this.cells;
			for ( var i = 0; i < cells.length; i++ )
				this.commitContent( cells[ i ] );

			this._.editor.forceNextSelectionCheck();
			selection.selectBookmarks( bookmarks );
			this._.editor.selectionChange();
		},
		onLoad: function() {
			var saved = {};

			// Prevent from changing cell properties when the field's value
			// remains unaltered, i.e. when selected multiple cells and dialog loaded
			// only the properties of the first cell (https://dev.ckeditor.com/ticket/11439).
			this.foreach( function( field ) {
				if ( !field.setup || !field.commit )
					return;

				// Save field's value every time after "setup" is called.
				field.setup = CKEDITOR.tools.override( field.setup, function( orgSetup ) {
					return function() {
						orgSetup.apply( this, arguments );
						saved[ field.id ] = field.getValue();
					};
				} );

				// Compare saved value with actual value. Update cell only if value has changed.
				field.commit = CKEDITOR.tools.override( field.commit, function( orgCommit ) {
					return function() {
						if ( saved[ field.id ] !== field.getValue() )
							orgCommit.apply( this, arguments );
					};
				} );
			} );
		}
	};

	function createSpacer( requiredContent ) {
		return {
			type: 'html',
			html: '&nbsp;',
			requiredContent: requiredContent ? requiredContent : undefined
		};
	}

	function whichColumns() {
		var columns = 'none';

		if ( editor.filter.check( [ 'td{width,height}', 'td{white-space}', 'td{text-align}', 'td{vertical-align}' ] ) ) {
			columns = 'first';
		}

		if ( editor.filter.check( [ 'th', 'td[rowspan]', 'td[colspan]', 'td{background-color}', 'td{border-color}' ] ) ) {
			columns = columns === 'first' ? 'both' : 'second';
		}

		return columns;
	}

	function getColumnsCount() {
		switch ( whichColumns() ) {
			case 'none':
				return 0;
			case 'both':
				return 2;
			default:
				return 1;
		}
	}

	function getWidths() {
		switch ( whichColumns() ) {
			case 'first':
				return [ '100%', '0' ];
			case 'second':
				return [ '0', '100%' ];
			default:
				return [ '40%', '5%', '40%' ];
		}
	}
	// Returns a function, which runs regular "setup" for all selected cells to find out
	// whether the initial value of the field would be the same for all cells. If so,
	// the value is displayed just as if a regular "setup" was executed. Otherwise,
	// i.e. when there are several cells of different value of the property, a field
	// gets empty value.
	//
	// * @param {Function} setup Setup function which returns a value instead of setting it.
	// * @returns {Function} A function to be used in dialog definition.
	function setupCells( setup ) {
		return function( cells ) {
			var fieldValue = setup( cells[ 0 ] );

			// If one of the cells would have a different value of the
			// property, set the empty value for a field.
			for ( var i = 1; i < cells.length; i++ ) {
				if ( setup( cells[ i ] ) !== fieldValue ) {
					fieldValue = null;
					break;
				}
			}

			// Setting meaningful or empty value only makes sense
			// when setup returns some value. Otherwise, a *default* value
			// is used for that field.
			if ( typeof fieldValue != 'undefined' ) {
				this.setValue( fieldValue );

				// The only way to have an empty select value in Firefox is
				// to set a negative selectedIndex.
				if ( CKEDITOR.env.gecko && this.type == 'select' && !fieldValue )
					this.getInputElement().$.selectedIndex = -1;
			}
		};
	}

	// Reads the unit of width property of the table cell.
	//
	// * @param {CKEDITOR.dom.element} cell An element representing table cell.
	// * @returns {String} A unit of width: 'px', '%' or undefined if none.
	function getCellWidthType( cell ) {
		var match = widthPattern.exec(
			cell.getStyle( 'width' ) || cell.getAttribute( 'width' ) );

		if ( match )
			return match[ 2 ];
	}
} );
