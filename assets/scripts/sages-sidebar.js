/**
 * SagesSidebar — detail panel for a selected sage.
 *
 * Shows: name, dates, era, relationships, bio, teachings, stories, share button.
 * Relationship names are clickable links that navigate to that sage.
 *
 * Usage:
 *   const sidebar = new SagesSidebar(containerEl, sagesData);
 *   sidebar.onNavigate = (sageId) => { ... };
 *   sidebar.open('rabbi-akiva');
 *   sidebar.close();
 */

class SagesSidebar {
	constructor(container, sagesData) {
		this.container = container;
		this.data = sagesData;
		this.onNavigate = null; // callback when user clicks a relationship
		this.onClose = null; // callback when sidebar closes
		this._currentId = null;
	}

	open(sageId) {
		const sage = this.data.getById(sageId);
		if (!sage) {
			return;
		}

		this._currentId = sageId;
		this.container.replaceChildren();
		this.container.classList.add('sages-sidebar-open');

		// Close button
		const closeBtn = document.createElement('button');
		closeBtn.className = 'sages-sidebar-close';
		closeBtn.textContent = '\u00D7';
		closeBtn.setAttribute('aria-label', 'Close');
		closeBtn.addEventListener('click', () => this.close());
		this.container.appendChild(closeBtn);
		requestAnimationFrame(() => closeBtn.focus());

		// Header
		this.container.appendChild(this._buildHeader(sage));

		// Share button
		const shareBtn = document.createElement('wa-button');
		shareBtn.setAttribute('appearance', 'outlined');
		shareBtn.setAttribute('size', 'small');
		const shareIcon = document.createElement('wa-icon');
		shareIcon.setAttribute('slot', 'start');
		shareIcon.setAttribute('name', 'arrow-up-from-bracket');
		shareBtn.appendChild(shareIcon);
		shareBtn.append(' Share');
		shareBtn.addEventListener('click', () => this._share(sage));
		const shareWrapper = document.createElement('div');
		shareWrapper.className = 'sages-sidebar-share';
		shareWrapper.appendChild(shareBtn);
		this.container.appendChild(shareWrapper);

		// Relationships
		const grouped = this.data.getGroupedRelationships(sageId);
		if (grouped.size > 0) {
			this.container.appendChild(this._buildRelationships(grouped));
		}

		// Bio
		if (sage.bio) {
			this.container.appendChild(this._buildSection('Biography', [sage.bio]));
		}

		// Teachings
		if (sage.teachings?.length > 0) {
			this.container.appendChild(
				this._buildListSection('Key Teachings', sage.teachings),
			);
		}

		// Stories
		if (sage.stories?.length > 0) {
			this.container.appendChild(
				this._buildListSection('Notable Stories', sage.stories),
			);
		}
	}

	_buildHeader(sage) {
		const header = document.createElement('div');
		header.className = 'sages-sidebar-header';

		const nameEn = document.createElement('h2');
		nameEn.className = 'sages-sidebar-name-en';
		nameEn.textContent = sage.name.en;
		header.appendChild(nameEn);

		const nameHe = document.createElement('p');
		nameHe.className = 'sages-sidebar-name-he';
		nameHe.setAttribute('dir', 'rtl');
		nameHe.textContent = sage.name.he;
		header.appendChild(nameHe);

		const meta = document.createElement('div');
		meta.className = 'sages-sidebar-meta';
		const eraBadge = document.createElement('wa-badge');
		eraBadge.setAttribute(
			'variant',
			sage.era === 'tanna' ? 'brand' : 'success',
		);
		eraBadge.textContent = `${sage.era === 'tanna' ? 'Tanna' : 'Amora'}, Generation ${sage.generation}`;
		meta.appendChild(eraBadge);
		if (sage.nasi) {
			const nasiBadge = document.createElement('wa-badge');
			nasiBadge.setAttribute('variant', 'warning');
			nasiBadge.textContent = 'Nasi';
			meta.appendChild(nasiBadge);
		}
		header.appendChild(meta);

		const dates = document.createElement('p');
		dates.className = 'sages-sidebar-dates';
		dates.textContent = this._formatDates(sage.dates);
		header.appendChild(dates);

		if (sage.locations?.length > 0) {
			const locations = document.createElement('p');
			locations.className = 'sages-sidebar-locations';
			locations.textContent = sage.locations.join(', ');
			header.appendChild(locations);
		}

		return header;
	}

	_buildRelationships(grouped) {
		const relSection = document.createElement('div');
		relSection.className = 'sages-sidebar-section';
		const heading = document.createElement('h3');
		heading.textContent = 'Relationships';
		relSection.appendChild(heading);

		const typeLabels = {
			teacher: 'Teachers',
			student: 'Students',
			father: 'Father',
			son: 'Sons',
			wife: 'Wife',
			husband: 'Husband',
			sibling: 'Siblings',
			'brother-in-law': 'Brothers-in-law',
		};

		for (const [type, targets] of grouped) {
			const group = document.createElement('div');
			group.className = 'sages-sidebar-rel-group';
			const label = document.createElement('strong');
			label.textContent = `${typeLabels[type] || type}: `;
			group.appendChild(label);

			for (let i = 0; i < targets.length; i++) {
				const link = document.createElement('a');
				link.href = `#sage:${targets[i].id}`;
				link.className = 'sages-sidebar-rel-link';
				link.textContent = targets[i].name.en;
				link.addEventListener('click', (e) => {
					e.preventDefault();
					if (this.onNavigate) {
						this.onNavigate(targets[i].id);
					}
				});
				group.appendChild(link);
				if (i < targets.length - 1) {
					group.append(', ');
				}
			}
			relSection.appendChild(group);
		}

		return relSection;
	}

	_buildSection(title, paragraphs) {
		const section = document.createElement('div');
		section.className = 'sages-sidebar-section';
		const heading = document.createElement('h3');
		heading.textContent = title;
		section.appendChild(heading);
		for (const text of paragraphs) {
			const p = document.createElement('p');
			p.textContent = text;
			section.appendChild(p);
		}
		return section;
	}

	_buildListSection(title, items) {
		const section = document.createElement('div');
		section.className = 'sages-sidebar-section';
		const heading = document.createElement('h3');
		heading.textContent = title;
		section.appendChild(heading);
		const ul = document.createElement('ul');
		for (const item of items) {
			const li = document.createElement('li');
			li.textContent = item;
			ul.appendChild(li);
		}
		section.appendChild(ul);
		return section;
	}

	close() {
		const previousId = this._currentId;
		this._currentId = null;
		this.container.classList.remove('sages-sidebar-open');
		this.container.replaceChildren();
		if (this.onClose) {
			this.onClose();
		}
		if (previousId) {
			requestAnimationFrame(() => {
				const node = document.querySelector(`[data-id="${previousId}"]`);
				if (node) {
					node.focus();
				}
			});
		}
	}

	get isOpen() {
		return this._currentId !== null;
	}

	get currentId() {
		return this._currentId;
	}

	_formatDates(dates) {
		return SagesData.formatDates(dates);
	}

	async _share(sage) {
		const url = `${window.location.origin}${window.location.pathname}#sage:${sage.id}`;
		const title = `${sage.name.en} \u2014 Talmudic Sages`;
		const shareData = { title, url };

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(url);
				const toast = document.querySelector('wa-toast');
				if (toast) {
					await customElements.whenDefined('wa-toast');
					toast.create('Link copied to clipboard', {
						variant: 'success',
						icon: 'check',
						duration: 2000,
					});
				}
			}
		} catch (err) {
			if (err.name !== 'AbortError') {
				console.error('Share failed:', err);
			}
		}
	}
}

window.SagesSidebar = SagesSidebar;
