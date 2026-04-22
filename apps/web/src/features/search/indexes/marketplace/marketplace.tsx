import { AppWindow, LayoutGrid, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackagesSearch } from "@/features/search/indexes/packages";
import { RecipesSearch } from "@/features/search/indexes/recipes/recipes";
import { TemplatesSearch } from "@/features/search/indexes/templates";

const MarketplaceSearch = () => {
  return (
    <Tabs defaultValue="packages" className="w-full">
      <TabsList className="border-(--color-neutral300) pt-10">
        <TabsTrigger value="packages" icon={<LayoutGrid className="h-4 w-4" />}>
          Packages
        </TabsTrigger>
        <TabsTrigger value="templates" icon={<AppWindow className="h-4 w-4" />}>
          Templates
        </TabsTrigger>
        <TabsTrigger value="recipes" icon={<Users className="h-4 w-4" />}>
          Recipes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="packages">
        <PackagesSearch />
      </TabsContent>
      <TabsContent value="templates">
        <TemplatesSearch />
      </TabsContent>
      <TabsContent value="recipes">
        <RecipesSearch />
      </TabsContent>
    </Tabs>
  );
};

export { MarketplaceSearch };
