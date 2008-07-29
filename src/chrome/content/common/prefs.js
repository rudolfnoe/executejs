/*
 * 
 * Common-Prefs Version 0.1 Created by Rudolf No� 28.12.2007
 * 
 * Partly copied from pref-tabprefs.js (c) Bradley Chapman (THANKS!)
 */
(function() {
	
	var ControlUtils = rno_common.ControlUtils
	
	// Attribute of a control under which key the preference should be stored
	PREF_ID_ATTR = "prefid"
	
	PrefTypes = {
		CHAR: "CHAR",
		BOOL: "BOOL"
	}

		var Prefs = {
		VERSION : "0.2",

		// Reference to pref-service
		prefs : Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch),

		getCharPref : function(key) {
			return this.prefs.getCharPref(key)
		},

		getBoolPref : function(key) {
			return this.prefs.getBoolPref(key)
		},

		getIntPref : function(key) {
			return this.prefs.getIntPref(key)
		},

		hasUserPref : function(key) {
			return this.prefs.prefHasUserValue(key);
		},

		setCharPref : function(key, value) {
			this.prefs.setCharPref(key, value);
		},

		setBoolPref : function(key, value) {
			this.prefs.setBoolPref(key, value);
		},

		clearUserPref : function(key) {
			this.prefs.clearUserPref(key)
		},

		/*
		 * Returns pref branch @param: branchKey (e.g. "executejs.") @returns
		 */
		getBranch : function(branchKey) {
			return this.prefs.getBranch(branchKey)
		},

		/*
		 * Loads all Prefs for the controls of a document The controls to
		 * restored must be identified with the prefid-Attribute
		 */
		loadPrefs : function(document) {
			// Checkboxes
			this.loadPrefsForTagName("checkbox", PrefTypes.BOOL, "checked")

			// Radiogroups
			this.loadPrefsForTagName("checkbox", PrefTypes.BOOL, "checked")
			
			// Textboxes
			this.loadPrefsForTagName("textbox", PrefTypes.CHAR, "value")

			// Keyinputboxes
			this.loadPrefsForTagName("keyinputbox", PrefTypes.CHAR, "combinedValue")

			// Menulist
			this.loadPrefsForTagName("menulist", PrefTypes.CHAR, "value")

         //Radiogroup
			this.loadPrefsForTagName("radiogroup", PrefTypes.CHAR, "value")
			
			// Listboxes
			// In case of Listboxes the complete XML of the listbox is stored
			var xmlParser = new DOMParser()
			var listboxes = document.getElementsByTagName("listbox")
			for (var i = 0; i < listboxes.length; i++) {
				var listbox = listboxes[i]
				if (!listbox.hasAttribute(PREF_ID_ATTR))
					continue
				var prefId = listbox.getAttribute(PREF_ID_ATTR)
				if (!Application.prefs.has(prefId)) {
					continue
				}
				var listboxXml = this.prefs.getCharPref(prefId)
				var prefListbox = xmlParser.parseFromString(listboxXml,
						"text/xml")
				var newListbox = document.importNode(
						prefListbox.documentElement, true)
				listbox.parentNode.replaceChild(newListbox, listbox);
			}

		},

		loadPrefsForTagName: function(tagName, prefType, valueAttribute){
				var elementList = document.getElementsByTagName(tagName);
				for (var i = 0; i < elementList.length; i++) {
					var element = elementList[i]
					if (!element.hasAttribute(PREF_ID_ATTR)) {
						continue
					}
					var prefValue = null
					if(prefType==PrefTypes.CHAR){
   					prefValue = this.prefs.getCharPref(element.getAttribute(PREF_ID_ATTR));
					}else if(prefType==PrefTypes.BOOL){
   					prefValue = this.prefs.getBoolPref(element.getAttribute(PREF_ID_ATTR));
					}
					element[valueAttribute] = prefValue
					if(tagName=="menulist"){
						ControlUtils.selectMenulistByValue(element, prefValue)
					}else if(tagName=="radiogroup"){
						ControlUtils.selectRadiogroupByValue(element, prefValue)
					}
				}
			
		},
		
		/*
		 * Saves prefs for all controls of an document The constrols for which
		 * prefs should be stored must have the prefid-attribute
		 */
		savePrefs : function(document) {
			try {
				// Checkboxes
				this.setPrefForTagName("checkbox", PrefTypes.BOOL, "checked");
				
				//Radio groups
				this.setPrefForTagName("radiogroup", PrefTypes.CHAR, "value");

				// Textboxes
				this.setPrefForTagName("textbox", PrefTypes.CHAR, "value");

				// Keyinputboxes
				this.setPrefForTagName("keyinputbox", PrefTypes.CHAR, "combinedValue");

				// Menulists
				this.setPrefForTagName("menulist", PrefTypes.CHAR, "value");

				// Listboxes
				// In case of Listboxes the complete XML of the listbox is
				// stored
				var listboxes = document.getElementsByTagName("listbox")
				for (var i = 0; i < listboxes.length; i++) {
					var listbox = listboxes[i]
					if (!listbox.hasAttribute(PREF_ID_ATTR))
						continue
					// Before serilization unneccessary attributes must be
					// stripped
					// as these would cause errors after parsing
					var listitems = listbox.getElementsByTagName("listitem")
					for (var j = 0; j < listitems.length; j++) {
						var item = listitems.item(j)
						var attrLabel = item.getAttribute("label")
						var attrValue = item.getAttribute("value")
						var attrs = item.attributes
						while (attrs.length > 0) {
							item.removeAttributeNode(attrs.item(0))
						}
						item.setAttribute("label", attrLabel)
						item.setAttribute("value", attrValue)
					}
					var xml = rno_common.XMLUtils.serializeToString(listbox);
					this.prefs.setCharPref(listbox.getAttribute(PREF_ID_ATTR),
							xml)
				}
			} catch (e) {
				alert(e);
			}
		},
		
		setPrefForTagName: function(tagName, prefType, valueAttribute){
				var elementList = document.getElementsByTagName(tagName);
				for (var i = 0; i < elementList.length; i++) {
					var element = elementList[i]
					if (!element.hasAttribute(PREF_ID_ATTR)) {
						continue
					}
					if(prefType==PrefTypes.CHAR){
   					this.prefs.setCharPref(element.getAttribute(PREF_ID_ATTR), element[valueAttribute]);
					}else if(prefType==PrefTypes.BOOL){
   					this.prefs.setBoolPref(element.getAttribute(PREF_ID_ATTR), element[valueAttribute]);
					}
				}
			
		},

		/*
		 * Returns the preferences wich are stored as a listbox @param prefid of
		 * the listbox @returns 2-dim array; the first dim represents the number
		 * of entries in the listbox; the second dim includes either only on
		 * entry (result[i][0]) with listitem.value in case the listbox has only
		 * one column or one entry per listcell with their respective value
		 */
		getPrefsForListbox : function(prefid) {
			var listboxXml = this.prefs.getCharPref(prefid)
			var listbox = rno_common.XMLUtils.parseFromString(listboxXml,
					"text/xml")
			var result = new Array()
			var listitems = listbox.getElementsByTagName("listitem")
			for (var i = 0; i < listitems.length; i++) {
				var listitem = listitems.item(i)
				var resultEntry = new Array();
				if (listitem.hasChildNodes()) {
					// listcell objects
					var listcells = listitem.getElementsByTagName("listcell")
					for (var j = 0; j < listcells.length; j++) {
						resultEntry[j] = listcells.item(j)
								.getAttribute("value")
					}
				} else {
					resultEntry[0] = listitem.getAttriubute("value")
				}
				result[i] = resultEntry
			}
			return result
		}
	}
	var Namespace = rno_common.Namespace;
	Namespace.bindToNamespace(Namespace.COMMON_NS, "Prefs", Prefs);
})()