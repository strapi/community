import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_card_grids';
  info: {
    displayName: 'Card Grid';
  };
  attributes: {
    items: Schema.Attribute.Component<'sections.card-grid-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 2;
        },
        number
      >;
  };
}

export interface SectionsCardGridItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_card_grid_items';
  info: {
    displayName: 'Card Grid Item';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.button', false> &
      Schema.Attribute.Required;
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'plugin::strapi-lucide-icons.icon'>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsCta extends Struct.ComponentSchema {
  collectionName: 'components_sections_ctas';
  info: {
    displayName: 'CTA';
  };
  attributes: {
    cta: Schema.Attribute.Relation<'oneToOne', 'api::cta.cta'>;
  };
}

export interface SectionsHighlights extends Struct.ComponentSchema {
  collectionName: 'components_sections_highlights';
  info: {
    displayName: 'Highlights';
  };
  attributes: {
    amount: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>;
    button: Schema.Attribute.Component<'shared.button', false>;
    grid: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>;
    integrations: Schema.Attribute.Relation<
      'oneToMany',
      'api::integration.integration'
    >;
    packages: Schema.Attribute.Relation<'oneToMany', 'api::package.package'>;
    query: Schema.Attribute.Enumeration<
      [
        'packages_highlighted',
        'packages_newest',
        'packages_selection',
        'templates_highlighted',
        'templates_newest',
        'templates_selection',
        'integrations_highlighted',
        'integrations_newest',
        'integrations_selection',
        'recipes_highlighted',
        'recipes_newest',
        'showcases_highlighted',
        'showcases_newest',
        'community_stars',
        'community_newest',
      ]
    > &
      Schema.Attribute.Required;
    templates: Schema.Attribute.Relation<'oneToMany', 'api::template.template'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsSearch extends Struct.ComponentSchema {
  collectionName: 'components_sections_searches';
  info: {
    displayName: 'Search';
  };
  attributes: {
    index_name: Schema.Attribute.Enumeration<
      [
        'generic_search',
        'marketplace',
        'integrations',
        'showcases',
        'partners',
        'members',
        'help_pages',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<['primary', 'secondary']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedLabels extends Struct.ComponentSchema {
  collectionName: 'components_shared_labels';
  info: {
    displayName: 'labels';
    icon: 'check';
  };
  attributes: {
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    official: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    recommended: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: 'openGraph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String & Schema.Attribute.Required;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SharedVersionInfo extends Struct.ComponentSchema {
  collectionName: 'components_shared_version_info';
  info: {
    displayName: 'Version Info';
    icon: 'information';
  };
  attributes: {
    install_command: Schema.Attribute.String;
    published_at: Schema.Attribute.DateTime;
    version: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.card-grid': SectionsCardGrid;
      'sections.card-grid-item': SectionsCardGridItem;
      'sections.cta': SectionsCta;
      'sections.highlights': SectionsHighlights;
      'sections.search': SectionsSearch;
      'shared.button': SharedButton;
      'shared.labels': SharedLabels;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
      'shared.version-info': SharedVersionInfo;
    }
  }
}
