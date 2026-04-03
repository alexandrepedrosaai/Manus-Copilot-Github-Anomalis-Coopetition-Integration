import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, ExternalLink, Clock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Search() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchMutation = trpc.search.query.useMutation();
  const { data: history } = trpc.search.history.useQuery();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchMutation.mutateAsync({ q: query.trim() });
      setResults(data);
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold neon-glow-cyan mb-2">SEARCH</h1>
            <p className="text-muted-foreground">Search the web using integrated Bing API</p>
          </div>
        </div>

        {/* Search Form */}
        <Card className="border-primary/30 neon-border-pink">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-lg"
              />
              <Button type="submit" disabled={isSearching} size="lg" className="px-8">
                {isSearching ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {results && (
          <Card className="border-secondary/30">
            <CardHeader>
              <CardTitle className="neon-glow-cyan">
                Search Results for "{results.query}"
              </CardTitle>
              <CardDescription>
                Found {results.total_results} results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.results && results.results.length > 0 ? (
                  results.results.map((result: any, index: number) => (
                    <a
                      key={index}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border border-border rounded-lg hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1 group-hover:neon-glow-pink transition-all">
                            {result.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">{result.snippet}</p>
                          <p className="text-xs text-primary flex items-center gap-1">
                            {result.url}
                            <ExternalLink className="h-3 w-3" />
                          </p>
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found for your query.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search History */}
        {history && history.length > 0 && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle className="text-accent flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setQuery(item.query);
                      handleSearch(new Event('submit') as any);
                    }}
                    className="w-full text-left p-3 border border-border rounded-lg hover:border-accent/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.query}</span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{item.resultsCount} results</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!results && (
          <Card className="border-muted/30">
            <CardContent className="py-12 text-center">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Enter a search query above to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
