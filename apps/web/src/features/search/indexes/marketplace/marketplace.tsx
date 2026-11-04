import { AppWindow, LayoutGrid } from "lucide-react";
import type { InstantSearchServerState } from "react-instantsearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackagesSearch } from "@/features/search/indexes/packages";
import { TemplatesSearch } from "@/features/search/indexes/templates";

type Props = {
  packagesServerState?: InstantSearchServerState;
  templatesServerState?: InstantSearchServerState;
};

const MarketplaceSearch = ({
  packagesServerState,
  templatesServerState,
}: Props) => {
  return (
    <Tabs defaultValue="packages" className="w-full">
      <TabsList className="border-(--color-neutral300) pb-10">
        <TabsTrigger value="packages" icon={<LayoutGrid className="h-4 w-4" />}>
          Packages
        </TabsTrigger>
        <TabsTrigger value="templates" icon={<AppWindow className="h-4 w-4" />}>
          Templates
        </TabsTrigger>
      </TabsList>
      <TabsContent value="packages">
        <PackagesSearch serverState={packagesServerState} />
      </TabsContent>
      <TabsContent value="templates">
        <TemplatesSearch serverState={templatesServerState} />
      </TabsContent>
    </Tabs>
  );
};

export { MarketplaceSearch };
