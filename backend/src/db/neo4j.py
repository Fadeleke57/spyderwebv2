from neo4j import GraphDatabase
from src.core.config import settings
from neo4j import Record, Session
from typing import Dict, Any, List, Tuple
from src.models.source import Source
from datetime import datetime
from pytz import UTC
from typing import Optional
from src.lib.logger.index import logger


class Neo4jDBService:
    def __init__(self) -> None:
        """
        Initialize a new Neo4jDBService instance.

        This method initializes a new Neo4jDBService instance, connecting to the Neo4j
        database at the specified URI with the given credentials.
        """
        self.driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_username, settings.neo4j_password),
            max_connection_lifetime=300,  # close stale connection after 5 minutes and reefresh
            keep_alive=True,  # keep connection alive
        )
        self.supported_labels = {"source", "connection"}

    def close(self) -> None:
        """
        Close the Neo4j driver connection.

        This method closes the connection to the Neo4j database, releasing any resources
        associated with the connection. It should be called to ensure proper cleanup
        when the database connection is no longer needed.
        """
        self.driver.close()

    def verify_connectivity(self) -> None:
        """
        Verify connectivity to the Neo4j database.

        This method is used to verify the connection to the Neo4j database,
        raising an error if the connection is not successful.

        Note:
            This method is not typically invoked directly. It is used internally
            by the Neo4jDBService to verify connectivity during service
            initialization.
        """
        self.driver.verify_connectivity()

    def session(self) -> Session:
        """
        Create a new session with the Neo4j database.

        This method returns a session object, which can be used to execute
        queries against the Neo4j database. Each session maintains its own
        transaction state and can be used for executing multiple queries in
        a transactional context.

        Returns:
            Session: A session object to interact with the Neo4j database.
        """

        return self.driver.session()

    def execute_query(
        self, query: str, parameters: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]

    def create_node(self, label: str, properties: Source) -> Dict[str, Any]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        query = f"CREATE (n:{label} $props) RETURN n"
        result = self.execute_query(query, {"props": properties})
        return result[0]["n"] if result else None

    def get_node_by_id(self, node_id: int) -> Dict[str, Any]:
        query = "MATCH (n) WHERE id(n) = $node_id RETURN n"
        result = self.execute_query(query, {"node_id": node_id})
        return result[0]["n"] if result else None

    def update_node(self, node_id: int, properties: Dict[str, Any]) -> Dict[str, Any]:
        query = "MATCH (n) WHERE id(n) = $node_id SET n += $props RETURN n"
        result = self.execute_query(query, {"node_id": node_id, "props": properties})
        return result[0]["n"] if result else None

    def delete_node(self, node_id: int) -> bool:
        query = "MATCH (n) WHERE id(n) = $node_id DELETE n"
        self.execute_query(query, {"node_id": node_id})
        return True

    def get_nodes_by_properties(
        self, label: str, properties: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        props_filter = " AND ".join([f"n.{key} = ${key}" for key in properties.keys()])
        query = f"MATCH (n:{label}) WHERE {props_filter} RETURN n"
        result = self.execute_query(query, properties)
        return [record["n"] for record in result]

    def delete_nodes_by_properties(self, label: str, properties: Dict[str, Any]) -> int:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        props_filter = " AND ".join([f"n.{key} = ${key}" for key in properties.keys()])
        query = f"MATCH (n:{label}) WHERE {props_filter} DELETE n RETURN count(n) AS deleted_count"
        result = self.execute_query(query, properties)
        return result[0]["deleted_count"] if result else 0

    def update_nodes_by_properties(
        self,
        label: str,
        match_properties: Dict[str, Any],
        update_properties: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        match_filter = " AND ".join(
            [f"n.{key} = ${key}" for key in match_properties.keys()]
        )
        query = (
            f"MATCH (n:{label}) WHERE {match_filter} SET n += $update_props RETURN n"
        )
        params = {**match_properties, "update_props": update_properties}
        result = self.execute_query(query, params)
        return [record["n"] for record in result]

    def create_many_nodes(
        self, label: str, nodes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        query_template = (
            f"UNWIND $props AS prop CREATE (n:{label}) SET n = prop RETURN n"
        )
        created_nodes = []

        with self.driver.session() as session:
            result = session.run(query_template, {"props": nodes})
            for record in result:
                created_nodes.append(record["n"])

        return created_nodes

    @staticmethod
    def serialize_source(source: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "sourceId": source["sourceId"],
            "userId": source["userId"],
            "name": source["name"],
            "url": source.get("url") or None,
            "content": source["content"],
            "webId": source["webId"],
            "created": source["created"],
            "updated": source["updated"],
            "size": source.get("size") or None,
        }

    @staticmethod
    def serialize_connection(connection: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": connection["id"],
            "sourceId": connection["sourceId"],
            "targetId": connection["targetId"],
            "created": connection["created"],
            "updated": connection["updated"],
        }

    def delete_relationship(
        self, start_node_id: int, end_node_id: int, relationship_type: str
    ) -> bool:
        query = f"""
        MATCH (start)-[r:{relationship_type}]-(end)
        WHERE id(start) = $start_id AND id(end) = $end_id
        DELETE r
        """
        params = {"start_id": start_node_id, "end_id": end_node_id}
        self.execute_query(query, params)
        return True

    def update_relationship(
        self,
        start_node_id: int,
        end_node_id: int,
        relationship_type: str,
        update_properties: Dict[str, Any],
    ) -> Dict[str, Any]:
        query = f"""
        MATCH (start)-[c:{relationship_type}]-(end)
        WHERE id(start) = $start_id AND id(end) = $end_id
        SET r += $update_props
        RETURN r
        """

        params = {
            "start_id": start_node_id,
            "end_id": end_node_id,
            "update_props": update_properties,
        }

        result = self.execute_query(query, params)

        return result[0]["r"] if result else None

    def create_relationship(
        self,
        start_node_id: int,
        end_node_id: int,
        relationship_type: str,
        properties: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        query = """
        MATCH (start), (end)
        WHERE id(start) = $start_id AND id(end) = $end_id
        CREATE (start)-[r:$rel_type $props]->(end)
        RETURN r
        """
        params = {
            "start_id": start_node_id,
            "end_id": end_node_id,
            "rel_type": relationship_type,
            "props": properties or {},
        }
        result = self.execute_query(query, params)
        return result[0]["r"] if result else None

    # spydr specific methods
    def get_all_sources_for_web(self, label: str, web_id: str) -> List[Dict[str, Any]]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        sources_query = """
        MATCH (s:source)
        WHERE s.webId=$web_id
        RETURN s {.*, created: toString(s.created), updated: toString(s.updated), size: toInteger(s.size) }
        """

        params = {"web_id": web_id}
        sources_result = self.execute_query(sources_query, params)
        sources = [source["s"] for source in sources_result]
        return sources

    def get_all_connections_for_web(
        self, label: str, web_id: str
    ) -> List[Dict[str, Any]]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        connections_query = """
        MATCH (s:source)-[c]->(t:source)
        WHERE s.webId=$web_id
        RETURN c {.*, created: toString(c.created), updated: toString(c.updated)}
        """

        params = {"web_id": web_id}
        connections_result = self.execute_query(connections_query, params)
        connections = [connection["c"] for connection in connections_result]
        return connections

    def get_outgoing_connections_for_source(
        self, label: str, source_id: str
    ) -> List[Dict[str, Any]]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        connections_query = """
        MATCH (s:source)-[c]->(t:source)
        WHERE c.fromSourceId=$source_id
        ORDER BY c.updated DESC
        RETURN c {.*, created: toString(c.created), updated: toString(c.updated)}
        """

        params = {"source_id": source_id}
        connections_result = self.execute_query(connections_query, params)
        connections = [connection["c"] for connection in connections_result]

        return connections

    def get_incoming_connections_for_source(
        self, label: str, source_id: str
    ) -> List[Dict[str, Any]]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        connections_query = """
        MATCH (s:source)-[c]->(t:source)
        WHERE c.toSourceId=$source_id
        ORDER BY c.updated DESC
        RETURN c {.*, created: toString(c.created), updated: toString(c.updated)}
        """

        params = {"source_id": source_id}
        connections_result = self.execute_query(connections_query, params)
        connections = [connection["c"] for connection in connections_result]

        return connections

    def get_connection_by_id(self, label: str, connection_id: str) -> Dict[str, Any]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        connections_query = """
        MATCH (s:source)-[c]->(t:source)
        WHERE c.connectionId=$connection_id
        RETURN c {.*, created: toString(c.created), updated: toString(c.updated)}
        """

        params = {"connection_id": connection_id}
        connections_result = self.execute_query(connections_query, params)
        connections = [connection["c"] for connection in connections_result]

        return connections

    def create_connection_between_sources(
        self,
        start_node_id: int,
        end_node_id: int,
        properties: Dict[str, Any] = None,
    ) -> Dict[str, Any]:

        query = """
        MATCH (s:source {sourceId: $start_id})
        MATCH (t:source {sourceId: $end_id})
        CREATE (s)-[c:connection $props]->(t)
        RETURN c {.*, created: toString(c.created), updated: toString(c.updated)}
        """
        params = {
            "start_id": start_node_id,
            "end_id": end_node_id,
            "props": properties or {},
        }
        result = self.execute_query(query, params)
        return result[0]["c"] if result else None

    def update_connection(
        self,
        connection_id,
        relationship_type: str,
        update_properties: Dict[str, Any],
    ) -> Dict[str, Any]:
        query = f"""
        MATCH (start)-[c:{relationship_type}]-(end)
        WHERE c.connectionId=$connection_id
        SET r += $update_props
        RETURN r
        """
        params = {
            "connection_id": connection_id,
            "update_props": update_properties,
        }
        result = self.execute_query(query, params)
        return result[0]["c"] if result else None

    def delete_connection(self, connection_id, relationship_type: str) -> bool:
        if relationship_type not in self.supported_labels:
            raise ValueError(f"Unsupported label: {relationship_type}")

        query = f"""
        MATCH (start)-[c:{relationship_type}]-(end)
        WHERE c.connectionId=$connection_id
        DELETE c
        """

        params = {"connection_id": connection_id}
        self.execute_query(query, params)
        return True

    def get_source_by_id(self, label: str, source_id: str) -> Dict[str, Any]:
        if label not in self.supported_labels:
            raise ValueError(f"Unsupported label: {label}")

        sources_query = """
        MATCH (s:source)
        WHERE s.sourceId=$source_id
        RETURN s {.*, created: toString(s.created), updated: toString(s.updated)}
        """

        params = {"source_id": source_id}
        sources_result = self.execute_query(sources_query, params)
        sources = [source["s"] for source in sources_result]
        return sources[0]

    def update_source(
        self, source_id: int, properties: Dict[str, Any]
    ) -> Dict[str, Any]:
        query = "MATCH (n) WHERE n.sourceId = $source_id SET n += $props RETURN n"
        result = self.execute_query(
            query, {"source_id": source_id, "props": properties}
        )
        return result[0]["n"] if result else None

    def delete_source(self, source_id: int) -> bool:
        query = "MATCH (n) WHERE n.sourceId = $source_id DETACH DELETE n"
        self.execute_query(query, {"source_id": source_id})
        return True

    def _create_connections_for_copied_sources(
        self, original_web_id: str, new_web_id: str, id_mapping: dict
    ) -> None:
        query = """
            MATCH (originalSource:source)-[c:connection]->(originalTarget:source)
            WHERE originalSource.webId = $originalWebId 
            AND originalTarget.webId = $originalWebId
            AND originalSource.sourceId IN $originalSourceIds
            AND originalTarget.sourceId IN $originalSourceIds
            
            WITH originalSource.sourceId AS origSourceId, 
                originalTarget.sourceId AS origTargetId,
                c,
                $idMapping AS idMapping
            
            MATCH (newSource:source), (newTarget:source)
            WHERE newSource.sourceId = idMapping[origSourceId]
            AND newTarget.sourceId = idMapping[origTargetId]
            AND newSource.webId = $newWebId
            AND newTarget.webId = $newWebId
            
            CREATE (newSource)-[newC:connection]->(newTarget)
            SET newC = c {.*, connectionId: randomUUID()}
        """

        self.execute_query(
            query,
            {
                "originalWebId": original_web_id,
                "newWebId": new_web_id,
                "idMapping": id_mapping,
                "originalSourceIds": list(id_mapping.keys()),
            },
        )

    def copy_sources_to_new_web(
        self,
        original_web_id: str,
        new_web_id: str,
        new_user_id: str,
        with_connections: bool = False,
    ) -> Tuple[str, List[str]]:
        # copy all source nodes and create a mapping
        query = """
        MATCH (originalSource:source)
        WHERE originalSource.webId = $originalWebId
        WITH originalSource, $newWebId AS newWebId, $newUserId AS newUserId

        CREATE (newSource:source)
        SET newSource = originalSource {.*, sourceId: randomUUID(), webId: newWebId, userId: newUserId}
        RETURN originalSource.sourceId AS originalSourceId, newSource.sourceId AS newSourceId;
        """

        result = self.execute_query(
            query,
            {
                "originalWebId": original_web_id,
                "newWebId": new_web_id,
                "newUserId": new_user_id,
            },
        )

        # create mapping and collect new source IDs
        id_mapping = {
            record["originalSourceId"]: record["newSourceId"] for record in result
        }
        new_source_ids = list(id_mapping.values())

        # if with_connections is True, create the connections between new sources
        if with_connections and id_mapping:
            self._create_connections_for_copied_sources(
                original_web_id, new_web_id, id_mapping
            )

        return new_web_id, new_source_ids


client = Neo4jDBService()
